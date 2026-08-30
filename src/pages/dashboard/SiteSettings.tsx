import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Image, Video, Save, Upload } from 'lucide-react';

const SETTINGS_KEY = 'imobispace_hero_background';

export default function SiteSettings() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState<'image' | 'video'>('image');
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const { data } = await supabase.from('site_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
      if (data?.value) {
        try {
          const value = JSON.parse(data.value as string);
          setType(value.type || 'image');
          setUrl(value.url || '');
          setPreview(value.url || '');
        } catch { /* fallback */ }
      }
    };
    load();
  }, [isAdmin]);

  const handleSave = async () => {
    if (!url.trim()) {
      toast({ title: 'Informe uma imagem ou vídeo', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const value = JSON.stringify({ type, url: url.trim() });
    const { error } = await supabase.from('site_settings').upsert({ key: SETTINGS_KEY, value }, { onConflict: 'key' });
    setSaving(false);
    if (error) {
      toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' });
      return;
    }
    setPreview(url.trim());
    toast({ title: 'Fundo do site atualizado', description: 'A alteração ficará disponível no site após a atualização.' });
  };

  const handleLocalFile = (file?: File) => {
    if (!file) return;
    if (type === 'video' && !file.type.startsWith('video/')) {
      toast({ title: 'Selecione um vídeo válido', variant: 'destructive' });
      return;
    }
    if (type === 'image' && !file.type.startsWith('image/')) {
      toast({ title: 'Selecione uma imagem válida', variant: 'destructive' });
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setUrl(localUrl);
    setPreview(localUrl);
    toast({ title: 'Arquivo selecionado', description: 'Para persistir no site, o arquivo precisa ser enviado ao Storage do projeto.' });
  };

  if (!isAdmin) return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Personalização do Site</h1>
          <p className="mt-1 text-muted-foreground">Troque o fundo principal do site sem alterar o código.</p>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle>Fundo principal (Hero)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={type} onValueChange={(v) => setType(v as 'image' | 'video')}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="image"><Image className="mr-2 h-4 w-4" />Imagem</TabsTrigger>
                <TabsTrigger value="video"><Video className="mr-2 h-4 w-4" />Vídeo</TabsTrigger>
              </TabsList>
              <TabsContent value="image" className="space-y-4">
                <Label>Arquivo ou URL da imagem</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Cole a URL ou selecione um arquivo" />
                <label className="inline-flex cursor-pointer">
                  <Button type="button" variant="outline" asChild><span><Upload className="mr-2 h-4 w-4" />Selecionar imagem</span></Button>
                  <input className="hidden" type="file" accept="image/*" onChange={(e) => handleLocalFile(e.target.files?.[0])} />
                </label>
              </TabsContent>
              <TabsContent value="video" className="space-y-4">
                <Label>Arquivo ou URL do vídeo</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Cole a URL ou selecione um MP4/WebM" />
                <label className="inline-flex cursor-pointer">
                  <Button type="button" variant="outline" asChild><span><Upload className="mr-2 h-4 w-4" />Selecionar vídeo</span></Button>
                  <input className="hidden" type="file" accept="video/mp4,video/webm,video/*" onChange={(e) => handleLocalFile(e.target.files?.[0])} />
                </label>
              </TabsContent>
            </Tabs>

            {preview && (
              <div className="overflow-hidden rounded-xl border bg-muted aspect-[16/7]">
                {type === 'video' ? <video src={preview} muted autoPlay loop playsInline className="h-full w-full object-cover" /> : <img src={preview} alt="Pré-visualização do fundo" className="h-full w-full object-cover" />}
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar fundo'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
