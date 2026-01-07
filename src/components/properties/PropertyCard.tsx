import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, FileText, ArrowRight } from 'lucide-react';

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    location: string;
    images: string[];
    ai_description: string | null;
    pdf_url: string | null;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images?.[0] || '/placeholder.svg';
  const shortDescription = property.ai_description?.slice(0, 120) + '...' || 'Descrição em breve...';

  return (
    <Card className="group overflow-hidden border-0 shadow-elegant hover:shadow-elegant-lg transition-all duration-500 hover:-translate-y-2 bg-gradient-card">
      <div className="relative h-56 overflow-hidden">
        <img
          src={mainImage}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {property.pdf_url && (
          <Badge className="absolute top-3 right-3 bg-white/90 text-foreground hover:bg-white">
            <FileText className="w-3 h-3 mr-1" />
            PDF
          </Badge>
        )}
        
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-xl font-semibold text-white line-clamp-1">
            {property.name}
          </h3>
          <p className="flex items-center gap-1 text-sm text-white/80 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {property.location}
          </p>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {shortDescription}
        </p>

        <Link to={`/empreendimento/${property.id}`} className="block">
          <Button variant="gold" className="w-full group/btn">
            Ver Detalhes
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
