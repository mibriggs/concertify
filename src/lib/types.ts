export type SpotifyRedirectOptions = {
    response_type: 'code',
    client_id: string,
    scope?: string,
    redirect_uri: string,
    state: string
};

export type SpotifyAccessTokenBody = {
    grant_type: 'authorization_code',
    code: string,
    redirect_uri: string,
};

export type SpotifyRefreshTokenBody = {
    grant_type: 'refresh_token',
    refresh_token: string,
};

export type AccessTokenSuccessResponse = {
    access_token: string,
    token_type: string,
    scope?: string,
    expires_in: number,
    refresh_token: string,
};

export type RefreshTokenSuccessResponse = {
    access_token: string,
    token_type: string,
    scope?: string,
    expires_in: number,
};

export type AccessTokenStoreType = AccessTokenSuccessResponse & {
    createdAt: Date,
};