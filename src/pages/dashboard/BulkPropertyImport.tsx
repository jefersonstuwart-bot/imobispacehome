import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Home } from "lucide-react";
import BulkImportTab from "@/components/dashboard/bulk-import/BulkImportTab";

const BulkPropertyImport = () => {
  const [activeTab, setActiveTab] = useState<"sale" | "rent">("sale");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Importar Imóveis em Lote
          </h1>
          <p className="text-muted-foreground mt-2">
            Importe dezenas de imóveis de uma vez com descrições geradas por IA
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "sale" | "rent")}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="sale" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Venda
            </TabsTrigger>
            <TabsTrigger value="rent" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Aluguel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sale" className="mt-6">
            <BulkImportTab category="sale" />
          </TabsContent>

          <TabsContent value="rent" className="mt-6">
            <BulkImportTab category="rent" />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BulkPropertyImport;
