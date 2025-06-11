export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      accouts: {
        Row: {
          attrs: Json | null;
          business_type: string | null;
          country: string | null;
          created: string | null;
          email: string | null;
          id: string | null;
          type: string | null;
        };
        Insert: {
          attrs?: Json | null;
          business_type?: string | null;
          country?: string | null;
          created?: string | null;
          email?: string | null;
          id?: string | null;
          type?: string | null;
        };
        Update: {
          attrs?: Json | null;
          business_type?: string | null;
          country?: string | null;
          created?: string | null;
          email?: string | null;
          id?: string | null;
          type?: string | null;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          attrs: Json | null;
          created: string | null;
          description: string | null;
          email: string | null;
          id: string | null;
          name: string | null;
        };
        Insert: {
          attrs?: Json | null;
          created?: string | null;
          description?: string | null;
          email?: string | null;
          id?: string | null;
          name?: string | null;
        };
        Update: {
          attrs?: Json | null;
          created?: string | null;
          description?: string | null;
          email?: string | null;
          id?: string | null;
          name?: string | null;
        };
        Relationships: [];
      };
      user_credits: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          lifetime_earned: number;
          lifetime_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance: number;
          lifetime_earned?: number;
          lifetime_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          lifetime_earned?: number;
          lifetime_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_credits_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          balance_after: number;
          type: Database['public']['Enums']['credit_transaction_type'];
          status: Database['public']['Enums']['transaction_status'];
          description: string | null;
          metadata: Json | null;
          reference_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          balance_after: number;
          type: Database['public']['Enums']['credit_transaction_type'];
          status?: Database['public']['Enums']['transaction_status'];
          description?: string | null;
          metadata?: Json | null;
          reference_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          balance_after?: number;
          type?: Database['public']['Enums']['credit_transaction_type'];
          status?: Database['public']['Enums']['transaction_status'];
          description?: string | null;
          metadata?: Json | null;
          reference_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'credit_transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      credit_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          credits: number;
          price: number;
          currency: string;
          is_subscription: boolean;
          billing_period: Database['public']['Enums']['billing_period'] | null;
          stripe_price_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          credits: number;
          price: number;
          currency: string;
          is_subscription: boolean;
          billing_period?: Database['public']['Enums']['billing_period'] | null;
          stripe_price_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          credits?: number;
          price?: number;
          currency?: string;
          is_subscription?: boolean;
          billing_period?: Database['public']['Enums']['billing_period'] | null;
          stripe_price_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      credit_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: Database['public']['Enums']['subscription_status'];
          stripe_subscription_id: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status?: Database['public']['Enums']['subscription_status'];
          stripe_subscription_id?: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          status?: Database['public']['Enums']['subscription_status'];
          stripe_subscription_id?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'credit_subscriptions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'credit_subscriptions_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'credit_plans';
            referencedColumns: ['id'];
          },
        ];
      };
      feature_costs: {
        Row: {
          id: string;
          feature_id: string;
          feature_name: string;
          credits_cost: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          feature_id: string;
          feature_name: string;
          credits_cost: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          feature_id?: string;
          feature_name?: string;
          credits_cost?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      image_edit_results: {
        Row: {
          created_at: string;
          id: string;
          liveportrait_compatible: boolean | null;
          liveportrait_detected_at: string | null;
          liveportrait_message: string | null;
          liveportrait_request_id: string | null;
          liveportrait_result_url: string | null;
          liveportrait_status: Database['public']['Enums']['task_status'] | null;
          request_parameters: Json | null;
          result_image_url: string[];
          result_type: string; // 'image' 或 'video'
          source_image_url: string;
          status: Database['public']['Enums']['task_status'];
          user_id: string;
          emoji_compatible: boolean | null;
          emoji_detected_at: string | null;
          emoji_message: string | null;
          emoji_face_bbox: string | null;
          emoji_ext_bbox: string | null;
          emoji_request_id: string | null;
          emoji_result_url: string | null;
          emoji_status: Database['public']['Enums']['task_status'] | null;
        };
        Insert: {
          created_at?: string;
          id: string;
          liveportrait_compatible?: boolean | null;
          liveportrait_detected_at?: string | null;
          liveportrait_message?: string | null;
          liveportrait_request_id?: string | null;
          liveportrait_result_url?: string[] | null;
          liveportrait_status?: Database['public']['Enums']['task_status'] | null;
          request_parameters?: Json | null;
          result_image_url: string[];
          result_type?: string; // 'image' 或 'video'
          source_image_url: string;
          status?: Database['public']['Enums']['task_status'];
          user_id: string;
          emoji_compatible?: boolean | null;
          emoji_detected_at?: string | null;
          emoji_message?: string | null;
          emoji_face_bbox?: string | null;
          emoji_ext_bbox?: string | null;
          emoji_request_id?: string | null;
          emoji_result_url?: string | null;
          emoji_status?: Database['public']['Enums']['task_status'] | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          liveportrait_compatible?: boolean | null;
          liveportrait_detected_at?: string | null;
          liveportrait_message?: string | null;
          liveportrait_request_id?: string | null;
          liveportrait_result_url?: string | null;
          liveportrait_status?: Database['public']['Enums']['task_status'] | null;
          request_parameters?: Json | null;
          result_image_url?: string[];
          result_type?: string; // 'image' 或 'video'
          source_image_url?: string;
          status?: Database['public']['Enums']['task_status'];
          user_id?: string;
          emoji_compatible?: boolean | null;
          emoji_detected_at?: string | null;
          emoji_message?: string | null;
          emoji_face_bbox?: string | null;
          emoji_ext_bbox?: string | null;
          emoji_request_id?: string | null;
          emoji_result_url?: string | null;
          emoji_status?: Database['public']['Enums']['task_status'] | null;
        };
        Relationships: [];
      };
      stripe_events: {
        Row: {
          api_version: string | null;
          attrs: Json | null;
          created: string | null;
          id: string | null;
          type: string | null;
        };
        Insert: {
          api_version?: string | null;
          attrs?: Json | null;
          created?: string | null;
          id?: string | null;
          type?: string | null;
        };
        Update: {
          api_version?: string | null;
          attrs?: Json | null;
          created?: string | null;
          id?: string | null;
          type?: string | null;
        };
        Relationships: [];
      };
      stripe_payment_intents: {
        Row: {
          amount: number | null;
          attrs: Json | null;
          created: string | null;
          currency: string | null;
          customer: string | null;
          id: string | null;
          payment_method: string | null;
        };
        Insert: {
          amount?: number | null;
          attrs?: Json | null;
          created?: string | null;
          currency?: string | null;
          customer?: string | null;
          id?: string | null;
          payment_method?: string | null;
        };
        Update: {
          amount?: number | null;
          attrs?: Json | null;
          created?: string | null;
          currency?: string | null;
          customer?: string | null;
          id?: string | null;
          payment_method?: string | null;
        };
        Relationships: [];
      };
      stripe_prices: {
        Row: {
          active: boolean | null;
          attrs: Json | null;
          created: string | null;
          currency: string | null;
          id: string | null;
          product: string | null;
          type: string | null;
          unit_amount: number | null;
        };
        Insert: {
          active?: boolean | null;
          attrs?: Json | null;
          created?: string | null;
          currency?: string | null;
          id?: string | null;
          product?: string | null;
          type?: string | null;
          unit_amount?: number | null;
        };
        Update: {
          active?: boolean | null;
          attrs?: Json | null;
          created?: string | null;
          currency?: string | null;
          id?: string | null;
          product?: string | null;
          type?: string | null;
          unit_amount?: number | null;
        };
        Relationships: [];
      };
      stripe_refunds: {
        Row: {
          amount: number | null;
          attrs: Json | null;
          charge: string | null;
          created: string | null;
          currency: string | null;
          id: string | null;
          payment_intent: string | null;
          reason: string | null;
          status: string | null;
        };
        Insert: {
          amount?: number | null;
          attrs?: Json | null;
          charge?: string | null;
          created?: string | null;
          currency?: string | null;
          id?: string | null;
          payment_intent?: string | null;
          reason?: string | null;
          status?: string | null;
        };
        Update: {
          amount?: number | null;
          attrs?: Json | null;
          charge?: string | null;
          created?: string | null;
          currency?: string | null;
          id?: string | null;
          payment_intent?: string | null;
          reason?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
      stripe_subscriptions: {
        Row: {
          attrs: Json | null;
          currency: string | null;
          current_period_end: string | null;
          current_period_start: string | null;
          customer: string | null;
          id: string | null;
        };
        Insert: {
          attrs?: Json | null;
          currency?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          customer?: string | null;
          id?: string | null;
        };
        Update: {
          attrs?: Json | null;
          currency?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          customer?: string | null;
          id?: string | null;
        };
        Relationships: [];
      };
      uploads: {
        Row: {
          createdAt: string | null;
          id: string;
          key: string;
          type: string;
          updatedAt: string | null;
          url: string;
          userId: string;
        };
        Insert: {
          createdAt?: string | null;
          id: string;
          key: string;
          type: string;
          updatedAt?: string | null;
          url: string;
          userId: string;
        };
        Update: {
          createdAt?: string | null;
          id?: string;
          key?: string;
          type?: string;
          updatedAt?: string | null;
          url?: string;
          userId?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      get_user_credits: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          balance: number;
          lifetime_earned: number;
          lifetime_spent: number;
        };
      };
      add_user_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_type: Database['public']['Enums']['credit_transaction_type'];
          p_description: string;
          p_reference_id?: string;
          p_metadata?: Json;
        };
        Returns: {
          success: boolean;
          message: string;
          transaction_id: string;
          new_balance: number;
        };
      };
      deduct_user_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_type: Database['public']['Enums']['credit_transaction_type'];
          p_description: string;
          p_reference_id?: string;
          p_metadata?: Json;
        };
        Returns: {
          success: boolean;
          message: string;
          transaction_id: string;
          new_balance: number;
        };
      };
      refund_user_credits: {
        Args: {
          p_transaction_id: string;
          p_reason: string;
        };
        Returns: {
          success: boolean;
          message: string;
          refund_transaction_id: string;
          new_balance: number;
        };
      };
    };
    Enums: {
      image_edit_function:
        | 'stylization_all'
        | 'stylization_local'
        | 'description_edit'
        | 'description_edit_with_mask'
        | 'remove_watermark'
        | 'expand'
        | 'super_resolution'
        | 'colorization'
        | 'doodle'
        | 'control_cartoon_feature';
      task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
      credit_transaction_type:
        | 'PURCHASE' // 购买积分
        | 'SUBSCRIPTION' // 订阅获得
        | 'REFERRAL' // 推荐奖励
        | 'BONUS' // 奖励积分
        | 'ADMIN_ADJUSTMENT' // 管理员调整
        | 'IMAGE_GENERATION' // 图片生成消费
        | 'VIDEO_GENERATION' // 视频生成消费
        | 'REFUND' // 退款
        | 'EXPIRATION' // 积分过期
        | 'PROMOTIONAL'; // 促销赠送
      transaction_status:
        | 'COMPLETED'
        | 'PENDING'
        | 'FAILED'
        | 'REFUNDED';
      subscription_status:
        | 'ACTIVE'
        | 'PAST_DUE'
        | 'CANCELED'
        | 'INCOMPLETE'
        | 'INCOMPLETE_EXPIRED'
        | 'TRIALING';
      billing_period:
        | 'MONTHLY'
        | 'QUARTERLY'
        | 'YEARLY';
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
    Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
      ? R
      : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
    DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
        ? R
        : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I;
  }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U;
  }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema['Enums']
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema['CompositeTypes']
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      image_edit_function: [
        'stylization_all',
        'stylization_local',
        'description_edit',
        'description_edit_with_mask',
        'remove_watermark',
        'expand',
        'super_resolution',
        'colorization',
        'doodle',
        'control_cartoon_feature',
      ],
      task_status: ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED'],
    },
  },
} as const;

// 便捷类型别名
export type Upload = Tables<'uploads'>;
export type UploadInsert = TablesInsert<'uploads'>;
export type UploadUpdate = TablesUpdate<'uploads'>;

export type ImageEditResult = Tables<'image_edit_results'>;
export type ImageEditResultInsert = TablesInsert<'image_edit_results'>;
export type ImageEditResultUpdate = TablesUpdate<'image_edit_results'>;

export type Customer = Tables<'customers'>;
export type CustomerInsert = TablesInsert<'customers'>;
export type CustomerUpdate = TablesUpdate<'customers'>;

export type Account = Tables<'accouts'>;
export type AccountInsert = TablesInsert<'accouts'>;
export type AccountUpdate = TablesUpdate<'accouts'>;

export type StripeEvent = Tables<'stripe_events'>;
export type StripeEventInsert = TablesInsert<'stripe_events'>;
export type StripeEventUpdate = TablesUpdate<'stripe_events'>;

export type StripePaymentIntent = Tables<'stripe_payment_intents'>;
export type StripePaymentIntentInsert = TablesInsert<'stripe_payment_intents'>;
export type StripePaymentIntentUpdate = TablesUpdate<'stripe_payment_intents'>;

export type StripePrice = Tables<'stripe_prices'>;
export type StripePriceInsert = TablesInsert<'stripe_prices'>;
export type StripePriceUpdate = TablesUpdate<'stripe_prices'>;

export type StripeRefund = Tables<'stripe_refunds'>;
export type StripeRefundInsert = TablesInsert<'stripe_refunds'>;
export type StripeRefundUpdate = TablesUpdate<'stripe_refunds'>;

export type StripeSubscription = Tables<'stripe_subscriptions'>;
export type StripeSubscriptionInsert = TablesInsert<'stripe_subscriptions'>;
export type StripeSubscriptionUpdate = TablesUpdate<'stripe_subscriptions'>;

// 枚举类型
export type TaskStatus = Enums<'task_status'>;
export type ImageEditFunction = Enums<'image_edit_function'>;

// 实用接口
export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type SortParams = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type FilterParams = {
  [key: string]: any;
};

export type QueryParams = {
  filters?: FilterParams;
} & PaginationParams & SortParams;

// API 响应类型
export type ApiResponse<T = any> = {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
};

export type PaginatedResponse<T = any> = {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} & ApiResponse<T[]>;

// 文件上传相关类型
export type UploadConfig = {
  maxSize: number; // bytes
  allowedTypes: string[];
  bucket: string;
};

export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

// 图片编辑相关类型
export type ImageEditRequest = {
  sourceImageUrl: string;
  function: ImageEditFunction;
  parameters?: Record<string, any>;
};

export type ImageEditResponse = {
  id: string;
  status: TaskStatus;
  resultImageUrls?: string[];
  message?: string;
  emojiResultUrls?: string[];
  emojiStatus?: TaskStatus;
  liveportraitResultUrls?: string[];
  liveportraitStatus?: TaskStatus;
};

// 添加积分系统相关类型别名
export type UserCredits = Tables<'user_credits'>;
export type UserCreditsInsert = TablesInsert<'user_credits'>;
export type UserCreditsUpdate = TablesUpdate<'user_credits'>;

export type CreditTransaction = Tables<'credit_transactions'>;
export type CreditTransactionInsert = TablesInsert<'credit_transactions'>;
export type CreditTransactionUpdate = TablesUpdate<'credit_transactions'>;

export type CreditPlan = Tables<'credit_plans'>;
export type CreditPlanInsert = TablesInsert<'credit_plans'>;
export type CreditPlanUpdate = TablesUpdate<'credit_plans'>;

export type CreditSubscription = Tables<'credit_subscriptions'>;
export type CreditSubscriptionInsert = TablesInsert<'credit_subscriptions'>;
export type CreditSubscriptionUpdate = TablesUpdate<'credit_subscriptions'>;

export type FeatureCost = Tables<'feature_costs'>;
export type FeatureCostInsert = TablesInsert<'feature_costs'>;
export type FeatureCostUpdate = TablesUpdate<'feature_costs'>;

// 枚举类型别名
export type CreditTransactionType = Enums<'credit_transaction_type'>;
export type TransactionStatus = Enums<'transaction_status'>;
export type SubscriptionStatus = Enums<'subscription_status'>;
export type BillingPeriod = Enums<'billing_period'>;

// 积分系统API接口类型
export type GetUserCreditsResponse = ApiResponse<{
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}>;

export type AddCreditsRequest = {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description?: string;
  referenceId?: string;
  metadata?: Record<string, any>;
};

export type DeductCreditsRequest = {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description?: string;
  referenceId?: string;
  metadata?: Record<string, any>;
};

export type RefundCreditsRequest = {
  transactionId: string;
  reason: string;
};

export type CreditTransactionResponse = ApiResponse<{
  transactionId: string;
  newBalance: number;
}>;

export type FeatureCreditCost = {
  [key in ImageEditFunction]: number;
} & {
  liveportrait_animation: number;
  emoji_animation: number;
};
