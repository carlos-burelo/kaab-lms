import type { getLessonById } from '@/actions/courseActions'

type LessonResponse = Awaited<ReturnType<typeof getLessonById>>
type ContentItem = NonNullable<LessonResponse['data']>['contents'][0]

export interface ContentEditorProps {
  content: ContentItem
  lessonId?: string
  onUpdate: (contentId: string, data: Partial<ContentItem>) => void
}
