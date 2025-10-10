import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

interface EmailTemplate {
  id: string;
  category: string;
  name: string;
  subject: string;
  html_content: string;
  variables: any;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  created_by?: string | null;
}

const categories = [
  { value: "onboarding", label: "Onboarding Sequence" },
  { value: "engagement", label: "Engagement & Activity" },
  { value: "monetization", label: "Monetization Sequences" },
  { value: "withdrawal", label: "Withdrawal Sequence" },
  { value: "referral", label: "Referral Sequence" },
  { value: "retention", label: "Retention & Win-Back" },
  { value: "admin", label: "Administrative Emails" },
];

export default function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("onboarding");
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (template: Partial<EmailTemplate>) => {
    try {
      if (editingTemplate?.id) {
        const { error } = await supabase
          .from("email_templates")
          .update({
            subject: template.subject,
            html_content: template.html_content,
            variables: template.variables,
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast({ title: "Success", description: "Template updated successfully" });
      } else {
        const { error } = await supabase
          .from("email_templates")
          .insert({
            category: template.category,
            name: template.name,
            subject: template.subject,
            html_content: template.html_content,
            variables: template.variables || [],
          });

        if (error) throw error;
        toast({ title: "Success", description: "Template created successfully" });
      }

      setIsDialogOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Success",
        description: `Template ${!isActive ? "activated" : "deactivated"}`,
      });
      fetchTemplates();
    } catch (error) {
      console.error("Error toggling template:", error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const handleApproveTemplate = async (id: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          is_approved: !isApproved,
          approved_at: !isApproved ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Success",
        description: `Template ${!isApproved ? "approved" : "unapproved"}`,
      });
      fetchTemplates();
    } catch (error) {
      console.error("Error approving template:", error);
      toast({
        title: "Error",
        description: "Failed to approve template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Template deleted successfully" });
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = templates.filter((t) => t.category === selectedCategory);

  if (loading) {
    return <div className="p-8 text-center">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Email Templates Manager
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage, review, and approve email templates for all user communications
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <EmailTemplateForm
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
              <Badge variant="secondary" className="ml-2">
                {templates.filter((t) => t.category === cat.value).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.value} value={cat.value} className="space-y-4">
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No templates in this category yet
                </CardContent>
              </Card>
            ) : (
              filteredTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {template.name.replace(/_/g, " ").toUpperCase()}
                          {template.is_active && (
                            <Badge variant="default">Active</Badge>
                          )}
                          {template.is_approved ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {template.subject}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTemplate(template);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={template.is_approved ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            handleApproveTemplate(template.id, template.is_approved)
                          }
                        >
                          {template.is_approved ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleActive(template.id, template.is_active)
                          }
                        >
                          {template.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Variables:</strong>{" "}
                        {Array.isArray(template.variables) && template.variables.length > 0
                          ? template.variables.map((v: string) => `{{${v}}}`).join(", ")
                          : "None"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last updated:{" "}
                        {new Date(template.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={() => setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Preview: {previewTemplate?.subject}</DialogTitle>
          </DialogHeader>
          <div
            className="border rounded-lg p-4 bg-background"
            dangerouslySetInnerHTML={{ __html: previewTemplate?.html_content || "" }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmailTemplateForm({
  template,
  onSave,
  onCancel,
}: {
  template: EmailTemplate | null;
  onSave: (template: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    category: template?.category || "onboarding",
    name: template?.name || "",
    subject: template?.subject || "",
    html_content: template?.html_content || "",
    variables: Array.isArray(template?.variables) ? template.variables.join(", ") : "",
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {template ? "Edit Template" : "Create New Template"}
        </DialogTitle>
        <DialogDescription>
          {template
            ? "Update the email template details"
            : "Create a new email template for user communications"}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
            disabled={!!template}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Template Name (Internal)</Label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g., welcome_fan"
            disabled={!!template}
          />
        </div>

        <div className="space-y-2">
          <Label>Email Subject</Label>
          <Input
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="e.g., Welcome to Hooks!"
          />
        </div>

        <div className="space-y-2">
          <Label>HTML Content</Label>
          <Textarea
            value={formData.html_content}
            onChange={(e) =>
              setFormData({ ...formData, html_content: e.target.value })
            }
            placeholder="<h1>Welcome {{name}}!</h1><p>Content here...</p>"
            rows={10}
          />
        </div>

        <div className="space-y-2">
          <Label>Variables (comma-separated)</Label>
          <Input
            value={formData.variables}
            onChange={(e) =>
              setFormData({ ...formData, variables: e.target.value })
            }
            placeholder="name, email, amount"
          />
          <p className="text-xs text-muted-foreground">
            Use these in the template as: {`{{variable_name}}`}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                ...formData,
                variables: formData.variables
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
              })
            }
          >
            {template ? "Update" : "Create"} Template
          </Button>
        </div>
      </div>
    </>
  );
}
