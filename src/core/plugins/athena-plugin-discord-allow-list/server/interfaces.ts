export interface DiscordUser {
    avatar?: null;
    communication_disabled_until?: null;
    flags: number;
    is_pending: boolean;
    joined_at: string;
    nick?: null;
    pending: boolean;
    premium_since: string;
    roles?: string[] | null;
    user: User;
    mute: boolean;
    deaf: boolean;
}

export interface User {
    id: string;
    username: string;
    global_name?: null;
    display_name?: null;
    avatar: string;
    discriminator: string;
    public_flags: number;
    avatar_decoration?: null;
}
