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
      image_edit_results: {
        Row: {
          created_at: string;
          id: string;
          liveportrait_compatible: boolean | null;
          liveportrait_detected_at: string | null;
          liveportrait_message: string | null;
          liveportrait_request_id: string | null;
          request_parameters: Json | null;
          result_image_url: string[];
          source_image_url: string;
          status: Database['public']['Enums']['task_status'];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          liveportrait_compatible?: boolean | null;
          liveportrait_detected_at?: string | null;
          liveportrait_message?: string | null;
          liveportrait_request_id?: string | null;
          request_parameters?: Json | null;
          result_image_url: string[];
          source_image_url: string;
          status?: Database['public']['Enums']['task_status'];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          liveportrait_compatible?: boolean | null;
          liveportrait_detected_at?: string | null;
          liveportrait_message?: string | null;
          liveportrait_request_id?: string | null;
          request_parameters?: Json | null;
          result_image_url?: string[];
          source_image_url?: string;
          status?: Database['public']['Enums']['task_status'];
          user_id?: string;
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
      [_ in never]: never
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
};
