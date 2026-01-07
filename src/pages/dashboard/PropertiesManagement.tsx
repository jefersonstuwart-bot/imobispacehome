import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Upload, Sparkles, Loader2, MapPin, Image, FileText, Eye } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  location: string;
  description: string | null;
  ai_description: string | null;
  images: string[];
  pdf_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function PropertiesManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    ai_description: '',
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; location: string; description?: string | null; ai_description?: string | null; images?: string[]; pdf_url?: string | null }) => {
      const { error } = await supabase.from('properties').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Empreendimento criado com sucesso!');
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao criar empreendimento', { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Property> }) => {
      const { error } = await supabase.from('properties').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Empreendimento atualizado!');
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar', { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Empreendimento excluído!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir', { description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', location: '', description: '', ai_description: '' });
    setUploadedImages([]);
    setPdfUrl(null);
    setEditingProperty(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      location: property.location,
      description: property.description || '',
      ai_description: property.ai_description || '',
    });
    setUploadedImages(property.images || []);
    setPdfUrl(property.pdf_url);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (!error) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
        newImages.push(data.publicUrl);
      }
    }

    setUploadedImages(prev => [...prev, ...newImages]);
    setUploadingImages(false);
    toast.success(`${newImages.length} imagem(ns) enviada(s)!`);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    const fileName = `${Date.now()}-${file.name}`;
    
    const { error } = await supabase.storage
      .from('property-documents')
      .upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage.from('property-documents').getPublicUrl(fileName);
      setPdfUrl(data.publicUrl);
      toast.success('PDF enviado com sucesso!');
    } else {
      toast.error('Erro ao enviar PDF');
    }
    setUploadingPdf(false);
  };

  const generateAIDescription = async () => {
    if (!formData.name || !formData.location) {
      toast.error('Preencha o nome e localização primeiro');
      return;
    }

    setGeneratingAI(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: {
          name: formData.name,
          location: formData.location,
          description: formData.description,
          images: uploadedImages,
        },
      });

      if (error) throw error;

      setFormData(prev => ({ ...prev, ai_description: data.description }));
      toast.success('Descrição gerada com IA!');
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Erro ao gerar descrição com IA');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.location) {
      toast.error('Nome e localização são obrigatórios');
      return;
    }

    const propertyData = {
      name: formData.name,
      location: formData.location,
      description: formData.description || null,
      ai_description: formData.ai_description || null,
      images: uploadedImages,
      pdf_url: pdfUrl,
    };

    if (editingProperty) {
      updateMutation.mutate({ id: editingProperty.id, data: propertyData });
    } else {
      createMutation.mutate(propertyData);
    }
  };

  const toggleActive = async (property: Property) => {
    await updateMutation.mutateAsync({
      id: property.id,
      data: { is_active: !property.is_active },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Empreendimentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os imóveis cadastrados na plataforma
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Empreendimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingProperty ? 'Editar Empreendimento' : 'Novo Empreendimento'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Empreendimento *</Label>
                    <Input
                      placeholder="Ex: Residencial Vista Mar"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Localização *</Label>
                    <Input
                      placeholder="Ex: Praia Grande, SP"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição Base</Label>
                  <Textarea
                    placeholder="Descrição básica do empreendimento (usado como base para IA)"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Descrição Persuasiva (IA)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIDescription}
                      disabled={generatingAI}
                    >
                      {generatingAI ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Gerar com IA
                    </Button>
                  </div>
                  <Textarea
                    placeholder="A descrição será gerada automaticamente pela IA..."
                    rows={5}
                    value={formData.ai_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, ai_description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Imagens</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingImages}
                      />
                      <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                        {uploadingImages ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Image className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Clique para enviar imagens
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {uploadedImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uploadedImages.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>PDF do Material</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingPdf}
                      />
                      <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                        {uploadingPdf ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : pdfUrl ? (
                          <>
                            <FileText className="w-5 h-5 text-success" />
                            <span className="text-sm text-success">PDF enviado</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Enviar PDF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button
                    variant="gold"
                    onClick={handleSubmit}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingProperty ? 'Salvar Alterações' : 'Criar Empreendimento'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : properties?.length === 0 ? (
          <Card className="border-0 shadow-elegant">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-1">Nenhum empreendimento</h3>
              <p className="text-muted-foreground text-sm">
                Clique em "Novo Empreendimento" para começar
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.map((property) => (
              <Card key={property.id} className="border-0 shadow-elegant overflow-hidden group">
                <div className="relative h-40 bg-muted">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge
                    className={`absolute top-2 right-2 ${
                      property.is_active
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {property.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg truncate">{property.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {property.location}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={property.is_active}
                        onCheckedChange={() => toggleActive(property)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {property.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(`/empreendimento/${property.id}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(property)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir?')) {
                            deleteMutation.mutate(property.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
