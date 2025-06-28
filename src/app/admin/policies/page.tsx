
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import type { PoliciesConfig, PolicyContent } from '@/types';
import { Loader2, Save } from 'lucide-react';

type PolicyName = keyof PoliciesConfig;

export default function PoliciesAdminPage() {
  const { config, setConfig, t } = useAdminConfig();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [policies, setPolicies] = useState<PoliciesConfig>(config.policiesConfig);

  useEffect(() => {
    setPolicies(config.policiesConfig);
  }, [config.policiesConfig]);

  const handlePolicyChange = (policyName: PolicyName, field: keyof PolicyContent, value: string | boolean) => {
    setPolicies(prev => ({
      ...prev,
      [policyName]: {
        ...prev[policyName],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await setConfig(prevConfig => ({
      ...prevConfig,
      policiesConfig: policies,
    }));
    setIsSaving(false);
    toast({ title: "Políticas actualizadas", description: "El contenido de las páginas de políticas ha sido guardado." });
  };
  
  const PolicyEditor = ({ policyName, title: tabTitle }: { policyName: PolicyName, title: string }) => {
    const policyData = policies[policyName];
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={`${policyName}-title`}>{t('adminPoliciesPageTitleLabel')}</Label>
          <Input 
            id={`${policyName}-title`}
            value={policyData.title}
            onChange={(e) => handlePolicyChange(policyName, 'title', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${policyName}-content`}>{t('adminPoliciesContentLabel')}</Label>
          <Textarea 
            id={`${policyName}-content`}
            value={policyData.content}
            onChange={(e) => handlePolicyChange(policyName, 'content', e.target.value)}
            rows={15}
            className="font-mono text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id={`${policyName}-showDate`}
            checked={policyData.showDate}
            onCheckedChange={(checked) => handlePolicyChange(policyName, 'showDate', checked)}
          />
          <Label htmlFor={`${policyName}-showDate`}>{t('adminPoliciesShowDateLabel')}</Label>
        </div>
         <div className="space-y-2">
          <Label htmlFor={`${policyName}-lastUpdated`}>{t('adminPoliciesLastUpdatedLabel')}</Label>
          <Input 
            id={`${policyName}-lastUpdated`}
            value={policyData.lastUpdated}
            onChange={(e) => handlePolicyChange(policyName, 'lastUpdated', e.target.value)}
            placeholder={t('adminPoliciesLastUpdatedPlaceholder')}
            disabled={!policyData.showDate}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">{t('adminPoliciesTitle')}</h1>
       <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t('adminPoliciesTitle')}</CardTitle>
            <CardDescription>{t('adminPoliciesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">{t('adminPoliciesAboutTab')}</TabsTrigger>
                <TabsTrigger value="privacy">{t('adminPoliciesPrivacyTab')}</TabsTrigger>
                <TabsTrigger value="terms">{t('adminPoliciesTermsTab')}</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-6">
                <PolicyEditor policyName="about" title={t('adminPoliciesAboutTab')} />
              </TabsContent>
              <TabsContent value="privacy" className="mt-6">
                 <PolicyEditor policyName="privacy" title={t('adminPoliciesPrivacyTab')} />
              </TabsContent>
              <TabsContent value="terms" className="mt-6">
                 <PolicyEditor policyName="terms" title={t('adminPoliciesTermsTab')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
         <Button type="submit" disabled={isSaving} className="mt-6">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Todos los Cambios
        </Button>
      </form>
    </div>
  );
}
