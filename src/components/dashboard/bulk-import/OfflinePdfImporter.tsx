import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type Extracted = {
  name: string; location: string; propertyType: string; bedrooms: string;
  suites: string; parking: string; sizeM2: string; price: string;
  description: string; developer: string; rawText: string;
};

const emptyData: Extracted = { name:"", location:"", propertyType:"", bedrooms:"", suites:"", parking:"", sizeM2:"", price:"", description:"", developer:"", rawText:"" };

const first = (text: string, patterns: RegExp[]) => {
  for (const p of patterns) { const m = text.match(p); if (m?.[1]) return m[1].trim(); }
  return "";
};
const numberBR = (value: string) => Number(value.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "")) || null;

function parseText(text: string): Extracted {
  const clean = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n").trim();
  const lines = clean.split("\n").map(l => l.trim()).filter(Boolean);
  const price = first(clean, [/(?:a partir de|valor|preço|preco)\s*[:\-]?\s*R\$\s*([\d.]+(?:,\d{2})?)/i, /(R\$\s*[\d.]+(?:,\d{2})?)/i]);
  const bedrooms = first(clean, [/(\d+)\s*(?:dormit[oó]rios?|quartos?)/i, /(\d+)\s*quartos?/i]);
  const suites = first(clean, [/(\d+)\s*(?:su[ií]tes?)/i]);
  const parking = first(clean, [/(\d+)\s*(?:vagas?|garagens?)/i]);
  const sizeM2 = first(clean, [/(\d+(?:[.,]\d+)?)\s*m(?:²|2)/i, /(?:[áa]rea(?: privativa)?|metragem)\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*m/i]);
  const location = first(clean, [/(?:bairro)\s*[:\-]?\s*([^\n,;]+)/i, /(?:endere[cç]o)\s*[:\-]?\s*([^\n]+)/i, /(?:localiza[cç][aã]o)\s*[:\-]?\s*([^\n]+)/i]);
  const developer = first(clean, [/(?:incorporadora|construtora|realiza[cç][aã]o)\s*[:\-]?\s*([^\n]+)/i]);
  const type = first(clean, [/(?:tipo(?:logia)?|tipo de im[oó]vel)\s*[:\-]?\s*([^\n]+)/i]);
  const name = first(clean, [/(?:empreendimento|residencial|condom[ií]nio|edif[ií]cio)\s*[:\-]?\s*([^\n]+)/i]) || lines.find(l => l.length > 4 && l.length < 80) || "";
  const description = lines.slice(0, 12).join(" ").slice(0, 1000);
  return { name, location, propertyType:type, bedrooms, suites, parking, sizeM2, price, developer, description, rawText:clean };
}

export default function OfflinePdfImporter({ category = "sale" }: { category?: "sale" | "rent" }) {
  const [data, setData] = useState<Extracted>(emptyData);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const readPdf = async (file: File) => {
    setReading(true); setError(""); setFileName(file.name); setProgress(10);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => "str" in item ? item.str : "").join(" ") + "\n";
        setProgress(Math.round(10 + (i / pdf.numPages) * 80));
      }
      if (!text.trim()) throw new Error("Este PDF não possui texto selecionável. Ele pode ser um PDF escaneado. A versão OCR local será adicionada como próxima etapa.");
      setData(parseText(text)); setProgress(100);
      toast({ title: "PDF lido localmente", description: "Nenhuma IA, token ou API externa foi utilizada." });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível ler o PDF");
    } finally { setReading(false); }
  };

  const save = async () => {
    if (!data.name.trim()) { setError("Informe o nome do empreendimento antes de salvar."); return; }
    setSaving(true); setError("");
    try {
      const { error: insertError } = await supabase.from("properties").insert({
        id: crypto.randomUUID(), name: data.name, location: data.location || "Não informado",
        description: data.description, images: [], category,
        property_type: data.propertyType || null, bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
        size_m2: numberBR(data.sizeM2), rental_value: category === "rent" ? numberBR(data.price) : null,
        is_active: true, import_folder_name: fileName, import_batch_id: crypto.randomUUID()
      });
      if (insertError) throw insertError;
      toast({ title: "Empreendimento salvo", description: "O cadastro foi criado e está disponível no painel." });
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao salvar empreendimento"); }
    finally { setSaving(false); }
  };

  const field = (label: string, key: keyof Extracted, placeholder = "") => (
    <div className="space-y-2"><Label>{label}</Label><Input value={data[key]} placeholder={placeholder} onChange={e => setData({ ...data, [key]: e.target.value })} /></div>
  );

  return <Card className="border-primary/20 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Importar empreendimento por PDF — modo offline</CardTitle>
      <CardDescription>O PDF é processado localmente no navegador. Sem IA, token, OpenAI ou API externa para interpretar os dados.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-10 text-center hover:bg-primary/10">
        <Upload className="mb-3 h-10 w-10 text-primary" /><span className="font-medium">Clique para selecionar o PDF</span><span className="mt-1 text-sm text-muted-foreground">Memorial, tabela de preços, catálogo ou apresentação</span>
        <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => e.target.files?.[0] && readPdf(e.target.files[0])} />
      </label>
      {reading && <div className="space-y-2"><div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Lendo PDF localmente...</div><Progress value={progress} /></div>}
      {fileName && !reading && <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" />{fileName}</div>}
      {error && <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {fileName && !reading && <>
        <div><h3 className="font-semibold">Revisar informações encontradas</h3><p className="text-sm text-muted-foreground">Confira e corrija os campos antes de publicar.</p></div>
        <div className="grid gap-4 md:grid-cols-2">{field("Empreendimento", "name")}{field("Incorporadora / construtora", "developer")}{field("Localização", "location")}{field("Tipo de imóvel", "propertyType")}{field("Quartos", "bedrooms")}{field("Suítes", "suites")}{field("Vagas", "parking")}{field("Área (m²)", "sizeM2")}{field("Valor", "price")}</div>
        <div className="space-y-2"><Label>Descrição</Label><Textarea value={data.description} rows={5} onChange={e => setData({ ...data, description:e.target.value })} /></div>
        <Button onClick={save} disabled={saving} size="lg" className="w-full">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Salvar empreendimento</Button>
      </>}
    </CardContent>
  </Card>;
}
