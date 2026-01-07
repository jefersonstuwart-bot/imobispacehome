import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Home, MessageCircle } from 'lucide-react';

export default function ProposalSuccess() {
  return (
    <Layout>
      <div className="container py-20 max-w-lg">
        <Card className="border-0 shadow-elegant-lg text-center">
          <CardContent className="pt-12 pb-8 px-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>

            <h1 className="font-display text-3xl font-bold text-foreground mb-4 animate-slide-up">
              Proposta Enviada!
            </h1>

            <p className="text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Sua proposta foi recebida com sucesso. Em breve um de nossos corretores 
              entrará em contato para dar continuidade ao atendimento.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 text-left">
                <MessageCircle className="w-8 h-8 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Fique atento!</p>
                  <p className="text-xs text-muted-foreground">
                    Você receberá contato via WhatsApp ou e-mail em até 24 horas úteis.
                  </p>
                </div>
              </div>
            </div>

            <Link to="/">
              <Button variant="gold" size="lg" className="w-full animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Home className="w-4 h-4 mr-2" />
                Voltar para Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
