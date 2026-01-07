import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, FileText, ArrowRight, Eye } from 'lucide-react';

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    location: string;
    images: string[] | null;
    ai_description: string | null;
    pdf_url: string | null;
    pdf_cover_image: string | null;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  // Prioriza: imagem do array > imagem de capa do PDF > placeholder
  const mainImage = property.images?.[0] || property.pdf_cover_image || '/placeholder.svg';
  const shortDescription = property.ai_description?.slice(0, 100) + '...' || 'Detalhes em breve...';

  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-luxury hover:shadow-gold transition-all duration-700 hover:-translate-y-3">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Overlay gradiente de luxo */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent opacity-80" />
        
        {/* Borda dourada sutil ao hover */}
        <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500 rounded-t-lg" />

        {/* Badge PDF */}
        {property.pdf_url && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-primary/20">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-navy-800">Material Disponível</span>
          </div>
        )}

        {/* Conteúdo sobre a imagem */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary font-medium mb-2">
            <MapPin className="w-3.5 h-3.5" />
            {property.location}
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-white leading-tight">
            {property.name}
          </h3>
        </div>
      </div>

      <CardContent className="p-6 space-y-4 bg-gradient-to-b from-card to-muted/30">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-light">
          {shortDescription}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Link to={`/empreendimento/${property.id}`} className="flex-1">
            <Button variant="gold" className="w-full group/btn tracking-wide">
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
