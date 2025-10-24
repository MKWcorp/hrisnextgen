export interface AlokasiPlatform {
  platform: string;
  percentage: number;
}

export interface AlokasiSumber {
  source: string;
  percentage: number;
}

export interface CreateGoalInput {
  goal_name: string;
  target_value: number;
  start_date: Date;
  end_date: Date;
  alokasi_platform: AlokasiPlatform[];
  alokasi_sumber: AlokasiSumber[];
}

export interface UpdateKPIInput {
  assigned_user_id: string;
  is_approved: boolean;
}

export interface CreateDailyTaskInput {
  kpi_id: string;
  user_id: string;
  task_description: string;
  task_date: Date;
}

export interface UpdateTaskInput {
  is_completed: boolean;
}
