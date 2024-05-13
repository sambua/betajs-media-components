export const PLAYER_URI = '/tests/playwright/html/player.html';
// export const PLAYER_URI = '/static/tests/playwright/html/player.html';
export const ASSETS_PATH = './tests/playwright/static/demos/assets';
// https://support.google.com/admanager/answer/10678356?hl=en#omid_p
// https://github.com/InteractiveAdvertisingBureau/AdCOM/blob/master/AdCOM%20v1.0%20FINAL.md#list_apiframeworks
// omid_p=examplepartnername/1.0.0.0&sdk_apis=7
export const AD_TAG_URL = `https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator=`;// &omid_p=other&sdk_apis=501
export const ERROR_TAG_URL = `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&nofb=1&correlator=`;// &omid_p=other&sdk_apis=501
// export const AD_TAG_URL = `//localhost:5050/static/demos/vast-samples/VAST_4_2/Inline_Linear_Tag-test.xml`;
export const SAMPLE_VIDEO_PATH = '/demos/sample-video.mp4';
export const SAMPLE_VIDEO_POSTER = '/demos/assets/sample-cover.png';
export const SAMPLE_2_VIDEO_PATH = '/demos/assets/portrait.mp4';
export const SAMPLE_2_VIDEO_POSTER = '/demos/assets/portrait-poster.png';
export const SAMPLE_3_VIDEO_PATH = '/demos/sample-video2.mp4';
export const SAMPLE_3_VIDEO_POSTER = '/demos/sample-cover2.png';
// export const SAMPLE_VIDEO_PATH = '/static/demos/sample-video.mp4';
// export const SAMPLE_VIDEO_POSTER = '/static/demos/assets/sample-cover.png';
// export const SAMPLE_2_VIDEO_PATH = '/static/demos/assets/portrait.mp4';
// export const SAMPLE_2_VIDEO_POSTER = '/static/demos/assets/portrait-poster.png';
// export const SAMPLE_3_VIDEO_PATH = '/static/demos/sample-video2.mp4';
// export const SAMPLE_3_VIDEO_POSTER = '/static/demos/sample-cover2.png';
export const CHROME_LOCATION = `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`;
export const CHROME_CANARY_LOCATION = process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH || `/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary`;

export const defaultPlayerAttributes = {
    source: SAMPLE_VIDEO_PATH,
    poster: SAMPLE_VIDEO_POSTER,
    playlist: [
        {
            source: SAMPLE_VIDEO_PATH,
            poster: SAMPLE_VIDEO_POSTER,
        },
        {
            source: SAMPLE_3_VIDEO_PATH,
            poster: SAMPLE_3_VIDEO_POSTER,
        },
        {
            source: SAMPLE_2_VIDEO_PATH,
            poster: SAMPLE_2_VIDEO_POSTER,
        },
    ]
}

export const VMAP_AD_TAG = `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator=`;
export const inlineVAST = ``
export const AD_TAGS = {
    0: null,
    1: AD_TAG_URL,
    3: inlineVAST,
    inline: inlineVAST,
    4: VMAP_AD_TAG,
    vmap: VMAP_AD_TAG,
}
