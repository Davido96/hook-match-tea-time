
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Clock, Crown, Zap, ToggleLeft, ToggleRight } from "lucide-react";

const SubscriptionPlanManager = () => {
  const { plans, loading, createPlan, updatePlan, deletePlan } = useSubscriptionPlans();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration_days: 30,
    price_keys: 0,
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      duration_days: 30,
      price_keys: 0,
      is_active: true
    });
    setEditingPlan(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || formData.price_keys <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, formData);
        toast({
          title: "Plan Updated",
          description: "Your subscription plan has been updated successfully"
        });
      } else {
        await createPlan(formData);
        toast({
          title: "Plan Created",
          description: "Your new subscription plan has been created successfully"
        });
      }
      
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save subscription plan",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      duration_days: plan.duration_days,
      price_keys: plan.price_keys,
      is_active: plan.is_active
    });
    setShowCreateDialog(true);
  };

  const handleToggleActive = async (plan: any) => {
    try {
      await updatePlan(plan.id, { is_active: !plan.is_active });
      toast({
        title: plan.is_active ? "Plan Deactivated" : "Plan Activated",
        description: `${plan.name} has been ${plan.is_active ? 'deactivated' : 'activated'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan status",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (plan: any) => {
    if (!confirm(`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePlan(plan.id);
      toast({
        title: "Plan Deleted",
        description: `${plan.name} has been deleted successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (days: number) => {
    if (days === 7) return "1 Week";
    if (days === 30) return "1 Month";
    if (days === 90) return "3 Months";
    if (days === 180) return "6 Months";
    if (days === 365) return "1 Year";
    return `${days} Days`;
  };

  const getPlanIcon = (days: number) => {
    if (days <= 7) return <Zap className="w-5 h-5 text-yellow-500" />;
    if (days <= 90) return <Clock className="w-5 h-5 text-blue-500" />;
    return <Crown className="w-5 h-5 text-purple-500" />;
  };

  const durationOptions = [
    { value: 7, label: "1 Week" },
    { value: 30, label: "1 Month" },
    { value: 90, label: "3 Months" },
    { value: 180, label: "6 Months" },
    { value: 365, label: "1 Year" }
  ];

  if (loading) {
    return <div className="text-center py-8">Loading subscription plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Plans</h2>
          <p className="text-gray-600">Manage your subscription offerings and pricing</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Plan Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Access, VIP Membership"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <select
                  value={formData.duration_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded-md"
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Price (Keys)</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.price_keys}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_keys: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter price in Keys"
                />
                <div className="text-xs text-gray-500 mt-1">
                  💡 Consider pricing based on duration: Week (50-200 Keys), Month (150-500 Keys)
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <label htmlFor="is_active" className="text-sm">Active (visible to subscribers)</label>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Crown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Subscription Plans</h3>
            <p className="text-gray-500 mb-6">
              Create your first subscription plan to start monetizing your content
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className={`${!plan.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPlanIcon(plan.duration_days)}
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <p className="text-sm text-gray-600">{formatDuration(plan.duration_days)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-lg font-bold">
                      {plan.price_keys} Keys
                    </Badge>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Created: {new Date(plan.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(plan)}
                    >
                      {plan.is_active ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(plan)}
                      className="text-red-500 hover:text-red-700"
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
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Pricing Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Weekly plans work great for exclusive content drops (50-200 Keys)</li>
          <li>• Monthly plans are popular for ongoing access (150-500 Keys)</li>
          <li>• Longer plans can offer better value to encourage commitment</li>
          <li>• Test different price points to find what works for your audience</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionPlanManager;
