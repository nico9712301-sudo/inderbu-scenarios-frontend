// Icons are now handled as strings - imported in client components
import { IOptionsRepository, OptionCategory } from '../domain/repositories/IOptionsRepository';

export class OptionsRepository implements IOptionsRepository {
  
  async getAllCategories(): Promise<OptionCategory[]> {
    try {
      // Static data for options - could come from database in the future
      // No authentication needed for static content
      const categories: OptionCategory[] = [
        {
          id: "content",
          title: "Contenido",
          description: "Gestiona el contenido de la plataforma",
          icon: 'ImageIcon',
          options: [
            {
              id: "banners",
              title: "Banners",
              description: "Gestiona los banners de las diferentes páginas",
              href: "/dashboard/options/banners",
            },
          ],
        },
        {
          id: "users",
          title: "Usuarios",
          description: "Gestiona los usuarios y permisos",
          icon: 'Users',
          options: [
            {
              id: "roles",
              title: "Roles y Permisos",
              description: "Configura los roles y permisos de los usuarios",
              href: "/opciones/roles",
            },
            {
              id: "admins",
              title: "Administradores",
              description: "Gestiona los usuarios administradores",
              href: "/opciones/administradores",
            },
          ],
        },
        {
          id: "system",
          title: "Sistema",
          description: "Configuraciones generales del sistema",
          icon: 'Settings',
          options: [
            {
              id: "notifications",
              title: "Notificaciones",
              description: "Configura las notificaciones del sistema",
              href: "/opciones/notificaciones",
            },
            {
              id: "security",
              title: "Seguridad",
              description: "Configura las opciones de seguridad",
              href: "/opciones/seguridad",
            },
          ],
        },
      ];

      return categories;
    } catch (error) {
      console.error('Error in OptionsRepository.getAllCategories:', error);
      throw error;
    }
  }
}
