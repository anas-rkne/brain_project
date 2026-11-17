import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'year', 'featured'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'اسم المشروع',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'client',
      type: 'text',
      localized: true,
      label: 'العميل',
    },
    {
      name: 'sector',
      type: 'text',
      localized: true,
      label: 'القطاع',
    },
    {
      name: 'location',
      type: 'text',
      localized: true,
      label: 'الموقع',
    },
    {
      name: 'year',
      type: 'number',
      label: 'السنة',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'القصة',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: 'وصف قصير',
            },
            {
              name: 'context',
              type: 'textarea',
              localized: true,
              label: 'السياق (المشكلة)',
            },
            {
              name: 'insight',
              type: 'textarea',
              localized: true,
              label: 'الفكرة المركزية',
            },
            {
              name: 'result',
              type: 'textarea',
              localized: true,
              label: 'النتيجة',
            },
          ],
        },
        {
          label: 'الوسائط',
          fields: [
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'صورة الغلاف',
            },
            {
              name: 'gallery',
              type: 'array',
              label: 'المعرض',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'التصنيف',
          fields: [
            {
              name: 'stages',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'الهوية', value: 'identity' },
                { label: 'التشغيل', value: 'social' },
                { label: 'البناء الرقمي', value: 'digital' },
              ],
              label: 'المراحل المنفّذة',
            },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
              label: 'مشروع مميّز (يظهر بالرئيسية)',
            },
            {
              name: 'order',
              type: 'number',
              label: 'ترتيب الظهور',
              admin: { position: 'sidebar' },
            },
          ],
        },
      ],
    },
  ],
}
