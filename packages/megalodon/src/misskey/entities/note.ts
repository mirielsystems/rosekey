/// <reference path="user.ts" />
/// <reference path="emoji.ts" />
/// <reference path="file.ts" />
/// <reference path="poll.ts" />

namespace MisskeyEntity {
  export type Note = {
    id: string
    createdAt: string
    userId: string
    user: User
    text: string | null
    cw: string | null
    visibility: 'public' | 'home' | 'followers' | 'specified'
    renoteCount: number
    repliesCount: number
    reactions: { [key: string]: number }
    // This field includes only remote emojis
    reactionEmojis: { [key: string]: string }
    emojis: Array<Emoji> | { [key: string]: string }
    fileIds: Array<string>
    files: Array<File>
    replyId: string | null
    renoteId: string | null
    uri?: string
    url?: string
    reply?: Note
    renote?: Note
    viaMobile?: boolean
    tags?: Array<string>
    poll?: Poll
    mentions?: Array<string>
    myReaction?: string
  }
}
