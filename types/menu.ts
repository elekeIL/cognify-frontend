export interface Menu {
  id: number | number;
  title: string;
  path?: string;
  newTab: boolean;
  submenu?: Menu[];
}
