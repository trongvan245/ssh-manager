export interface Host {
  host: string;
  hostname: string;
  user?: string;
  identity_file?: string;
  port?: number;
  tags?: string[];
  last_connect?: Date;
}
