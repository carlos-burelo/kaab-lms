import { mergeAttributes, Node } from '@tiptap/core'

export interface VideoOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType
    }
  }
}

export const Video = Node.create<VideoOptions>({
  name: 'video',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {}
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null
      },
      controls: {
        default: true
      },
      width: {
        default: '100%'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64 ? 'video[src]' : 'video[src]:not([src^="data:"])'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options
          })
        }
    }
  }
})
