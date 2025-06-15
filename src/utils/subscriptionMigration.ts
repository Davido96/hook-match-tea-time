
import { supabase } from '@/integrations/supabase/client';

export const migrateUserSubscriptionFee = async (userId: string) => {
  try {
    // Get user's profile with subscription_fee
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_fee, name')
      .eq('user_id', userId)
      .eq('user_type', 'creator')
      .single();

    if (profileError || !profile || !profile.subscription_fee || profile.subscription_fee <= 0) {
      console.log('No subscription fee to migrate or user is not a creator');
      return { success: true, message: 'No migration needed' };
    }

    // Check if user already has subscription plans
    const { data: existingPlans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('creator_id', userId);

    if (plansError) {
      console.error('Error checking existing plans:', plansError);
      return { success: false, error: plansError.message };
    }

    if (existingPlans && existingPlans.length > 0) {
      console.log('User already has subscription plans, skipping migration');
      return { success: true, message: 'User already has plans' };
    }

    // Create default subscription plans based on the subscription_fee
    const baseFee = profile.subscription_fee;
    const plansToCreate = [
      {
        creator_id: userId,
        name: "Weekly Access",
        duration_days: 7,
        price_keys: Math.round(baseFee * 0.25), // 25% of monthly fee
        is_active: true
      },
      {
        creator_id: userId,
        name: "Monthly Access",
        duration_days: 30,
        price_keys: baseFee,
        is_active: true
      },
      {
        creator_id: userId,
        name: "3-Month Access",
        duration_days: 90,
        price_keys: Math.round(baseFee * 2.5), // Slight discount for longer term
        is_active: true
      }
    ];

    // Insert the new plans
    const { data: createdPlans, error: createError } = await supabase
      .from('subscription_plans')
      .insert(plansToCreate)
      .select();

    if (createError) {
      console.error('Error creating subscription plans:', createError);
      return { success: false, error: createError.message };
    }

    console.log(`Successfully migrated subscription fee for user ${userId}:`, createdPlans);
    return { 
      success: true, 
      message: `Created ${createdPlans?.length || 0} subscription plans`,
      plans: createdPlans 
    };

  } catch (error: any) {
    console.error('Migration error:', error);
    return { success: false, error: error.message };
  }
};

export const migrateAllCreatorSubscriptionFees = async () => {
  try {
    // Get all creators with subscription fees but no plans
    const { data: creatorsWithFees, error: creatorsError } = await supabase
      .from('profiles')
      .select('user_id, subscription_fee, name')
      .eq('user_type', 'creator')
      .gt('subscription_fee', 0);

    if (creatorsError) {
      console.error('Error fetching creators:', creatorsError);
      return { success: false, error: creatorsError.message };
    }

    if (!creatorsWithFees || creatorsWithFees.length === 0) {
      return { success: true, message: 'No creators with subscription fees found' };
    }

    const results = [];
    for (const creator of creatorsWithFees) {
      const result = await migrateUserSubscriptionFee(creator.user_id);
      results.push({
        userId: creator.user_id,
        name: creator.name,
        ...result
      });
      
      // Add small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: true,
      message: `Migration completed: ${successful} successful, ${failed} failed`,
      results
    };

  } catch (error: any) {
    console.error('Bulk migration error:', error);
    return { success: false, error: error.message };
  }
};
