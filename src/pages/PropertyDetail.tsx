import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, FileText, ChevronLeft, ChevronRight, X, Download, Send } from 'lucide-react';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Empreendimento não encontrado</h1>
          <Link to="/">
            <Button>Voltar para Início</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = property.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar aos Empreendimentos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="space-y-4">
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              <DialogTrigger asChild>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group">
                  <img
                    src={hasImages ? images[currentImageIndex] : '/placeholder.svg'}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">
                      Clique para ampliar
                    </span>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 bg-black/95">
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <img
                  src={images[currentImageIndex]}
                  alt={property.name}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </DialogContent>
            </Dialog>

            {/* Thumbnails */}
            {hasImages && images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-secondary shadow-gold'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Navigation arrows for multiple images */}
            {hasImages && images.length > 1 && (
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="icon" onClick={prevImage}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="flex items-center text-sm text-muted-foreground">
                  {currentImageIndex + 1} / {images.length}
                </span>
                <Button variant="outline" size="icon" onClick={nextImage}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2 bg-secondary/10 text-secondary border-0">
                Disponível
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                {property.name}
              </h1>
              <p className="flex items-center gap-2 text-lg text-muted-foreground">
                <MapPin className="w-5 h-5" />
                {property.location}
              </p>
            </div>

            {property.ai_description && (
              <Card className="border-0 shadow-elegant bg-gradient-card">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="text-gradient">✨ Descrição IA</span>
                  </h3>
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                    {property.ai_description}
                  </p>
                </CardContent>
              </Card>
            )}

            {property.pdf_url && (
              <a href={property.pdf_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Material Completo (PDF)
                  <Download className="w-4 h-4 ml-2" />
                </Button>
              </a>
            )}

            <Link to={`/proposta/${property.id}`}>
              <Button variant="hero" size="xl" className="w-full">
                <Send className="w-5 h-5 mr-2" />
                Enviar Proposta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
