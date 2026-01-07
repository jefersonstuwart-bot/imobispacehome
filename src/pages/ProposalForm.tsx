import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChevronLeft, Upload, Loader2, CheckCircle, User, FileText, CreditCard } from 'lucide-react';
import { MARITAL_STATUS_LABELS, PROPOSAL_TYPE_LABELS, DOCUMENT_TYPES, SPOUSE_DOCUMENT_TYPES } from '@/lib/constants';

const proposalSchema = z.object({
  client_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  client_cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF inválido'),
  client_rg: z.string().min(5, 'RG inválido'),
  client_phone: z.string().min(10, 'Telefone inválido'),
  client_email: z.string().email('E-mail inválido'),
  client_marital_status: z.enum(['single', 'married', 'divorced', 'widowed']),
  spouse_name: z.string().optional(),
  spouse_cpf: z.string().optional(),
  spouse_rg: z.string().optional(),
  proposal_type: z.enum(['cash', 'financed']),
  proposal_value: z.string().min(1, 'Valor é obrigatório'),
  proposal_description: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

export default function ProposalForm() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const { data: property } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, location')
        .eq('id', propertyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      client_name: '',
      client_cpf: '',
      client_rg: '',
      client_phone: '',
      client_email: '',
      client_marital_status: 'single',
      proposal_type: 'financed',
      proposal_value: '',
      proposal_description: '',
    },
  });

  const maritalStatus = form.watch('client_marital_status');
  const isMarried = maritalStatus === 'married';

  const handleFileUpload = (docType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedDocs(prev => ({ ...prev, [docType]: file }));
    }
  };

  const uploadDocuments = async (proposalId: string) => {
    const documents: { proposal_id: string; document_type: string; file_url: string; file_name: string; is_spouse_document: boolean }[] = [];

    for (const [docType, file] of Object.entries(uploadedDocs)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${proposalId}/${docType}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('client-documents')
        .getPublicUrl(fileName);

      documents.push({
        proposal_id: proposalId,
        document_type: docType,
        file_url: urlData.publicUrl,
        file_name: file.name,
        is_spouse_document: docType.startsWith('spouse_'),
      });
    }

    if (documents.length > 0) {
      await supabase.from('client_documents').insert(documents);
    }
  };

  const onSubmit = async (data: ProposalFormData) => {
    if (!propertyId) return;

    // Validate required documents
    const requiredDocs = DOCUMENT_TYPES.filter(d => d.required).map(d => d.id);
    const missingDocs = requiredDocs.filter(doc => !uploadedDocs[doc]);
    
    if (missingDocs.length > 0) {
      toast.error('Documentos obrigatórios faltando', {
        description: 'Por favor, faça upload de todos os documentos obrigatórios.',
      });
      return;
    }

    if (isMarried) {
      const requiredSpouseDocs = SPOUSE_DOCUMENT_TYPES.filter(d => d.required).map(d => d.id);
      const missingSpouseDocs = requiredSpouseDocs.filter(doc => !uploadedDocs[doc]);
      
      if (missingSpouseDocs.length > 0) {
        toast.error('Documentos do cônjuge faltando', {
          description: 'Por favor, faça upload dos documentos do cônjuge.',
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const proposalValue = parseFloat(data.proposal_value.replace(/[^\d,]/g, '').replace(',', '.'));

      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          property_id: propertyId,
          client_name: data.client_name,
          client_cpf: data.client_cpf,
          client_rg: data.client_rg,
          client_phone: data.client_phone,
          client_email: data.client_email,
          client_marital_status: data.client_marital_status,
          spouse_name: isMarried ? data.spouse_name : null,
          spouse_cpf: isMarried ? data.spouse_cpf : null,
          spouse_rg: isMarried ? data.spouse_rg : null,
          proposal_type: data.proposal_type,
          proposal_value: proposalValue,
          proposal_description: data.proposal_description,
          status: 'new',
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      await uploadDocuments(proposal.id);

      toast.success('Proposta enviada com sucesso!', {
        description: 'Em breve um corretor entrará em contato.',
      });

      navigate('/proposta-enviada');
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast.error('Erro ao enviar proposta', {
        description: 'Por favor, tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <Link to={`/empreendimento/${propertyId}`} className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar ao Empreendimento
        </Link>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Enviar Proposta
          </h1>
          {property && (
            <p className="text-muted-foreground">
              {property.name} • {property.location}
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-secondary" />
                  Dados Pessoais
                </CardTitle>
                <CardDescription>Preencha seus dados para contato</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client_name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client_cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client_rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG *</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu RG" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone/WhatsApp *</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client_marital_status"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Estado Civil *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(MARITAL_STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dados do Cônjuge */}
                {isMarried && (
                  <>
                    <div className="md:col-span-2 border-t pt-4 mt-2">
                      <h4 className="font-medium mb-4">Dados do Cônjuge</h4>
                    </div>
                    <FormField
                      control={form.control}
                      name="spouse_name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nome do Cônjuge *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo do cônjuge" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="spouse_cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF do Cônjuge *</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="spouse_rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG do Cônjuge *</FormLabel>
                          <FormControl>
                            <Input placeholder="RG do cônjuge" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Documentos */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  Documentos
                </CardTitle>
                <CardDescription>Faça upload dos documentos obrigatórios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DOCUMENT_TYPES.map((doc) => (
                    <div key={doc.id} className="space-y-2">
                      <Label className="flex items-center gap-1">
                        {doc.label}
                        {doc.required && <span className="text-destructive">*</span>}
                      </Label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload(doc.id)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg transition-colors ${
                          uploadedDocs[doc.id] 
                            ? 'border-success bg-success/10' 
                            : 'border-muted-foreground/30 hover:border-primary'
                        }`}>
                          {uploadedDocs[doc.id] ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-success" />
                              <span className="text-sm text-success truncate max-w-[150px]">
                                {uploadedDocs[doc.id].name}
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Selecionar arquivo</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Documentos do Cônjuge */}
                {isMarried && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-4">Documentos do Cônjuge</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SPOUSE_DOCUMENT_TYPES.map((doc) => (
                        <div key={doc.id} className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {doc.label}
                            {doc.required && <span className="text-destructive">*</span>}
                          </Label>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileUpload(doc.id)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg transition-colors ${
                              uploadedDocs[doc.id] 
                                ? 'border-success bg-success/10' 
                                : 'border-muted-foreground/30 hover:border-primary'
                            }`}>
                              {uploadedDocs[doc.id] ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-success" />
                                  <span className="text-sm text-success truncate max-w-[150px]">
                                    {uploadedDocs[doc.id].name}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Selecionar arquivo</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Proposta */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-secondary" />
                  Detalhes da Proposta
                </CardTitle>
                <CardDescription>Informe os detalhes da sua proposta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="proposal_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Proposta *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          {Object.entries(PROPOSAL_TYPE_LABELS).map(([value, label]) => (
                            <div key={value} className="flex items-center space-x-2">
                              <RadioGroupItem value={value} id={value} />
                              <Label htmlFor={value} className="cursor-pointer">{label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proposal_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Proposta (R$) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 500.000,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proposal_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Proposta</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os detalhes da sua proposta, condições de pagamento, etc."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Enviando Proposta...
                </>
              ) : (
                'Enviar Proposta'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
