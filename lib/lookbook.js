const nightmare = require('x-ray-nightmare');
const Xray = require('x-ray');
const baseUrl = "http://lookbook.nu/";
const baseLookUrl = "http://lookbook.nu/look/";
const baseExploreUrl = "http://lookbook.nu/explore/";
const baseUserUrl = "http://lookbook.nu/user/";

function initXray() {
    return x = Xray({
        filters: {
            clean: string => string.replace(/\n/g, '').trim(),
            cleanLookup : string => string.split("|")[1].trim(),
            paid: link => link.includes("shareasale.com"),
            getPaidUrl: link => {console.log("link", link); return (link.includes("shareasale.com")) ? link.split("urllink=")[1] : link },
            cleanPaidUrl: link => decodeURIComponent(link),
            BaseUrl: string => {var url = baseUrl + string; return url.replace(/\/\//g, "/").replace("/hype", '')},
            LookUrl : string => baseLookUrl + string,
            lowercase : string => string.toLowerCase(),
            nodashnospace : string => string.replace(/ /g, '').replace(/-/g, ''),
            exploreUrl : string => baseExploreUrl + string,
            userIdFromUrl: string => {var id = string.split(baseUserUrl)[1]; return id.split("-")[0] }
        }
    });
}

var exports = module.exports = {};

function selectGenderHomePage(ctx, nightmare) {
    return nightmare
        .goto(ctx.url)
        .click(`a[data-gender="${nightmare.options.gender}"]`)
        .screenshot("test.png")
        .wait();
}

function selectGenderExplorePage(ctx, nightmare) {
    return nightmare
        .goto(ctx.url)
        .click('a.current-gender')
        .click(`a[data-gender="${nightmare.options.gender}"]`)
        //.screenshot("explore.png")
        .wait(500);
}

exports.getLooks = function(path, place = '', gender = null) {
    x = initXray();
    if(place != '') {
        place = place+"/";
    }

    if(gender !== null) {
        x = initXray().driver(nightmare({
            gender: gender
        }, selectGenderHomePage));
    }

    return x(baseUrl+place+path, '#looks', {
        looks: x('.look_v2', [{
            user: '.name a',
            userUrl: '.name a@href',
            imageUrl : '.look_photo img@src',
            lookId: 'a@name',
            lookUrl: '.look_photo a@href'
        }])
    })
    .stream();
}

exports.getLook = function(lookId) {
    x = initXray();
    return x(baseLookUrl+lookId, '.look_main', {
        title: '.look-meta-container h1 | clean',
        imageUrl: '.look_photo a img@src',
        lookUrl: '#look_photo_container@data-page-track | cleanLookup | LookUrl',
        description: '#look_descrip | clean',
        userAvatar: '.user-avatar img@src',
        realName: '.info .name a',
        profile: '.info .name a@href',
        items: x('#side_col .look-items-list ', '.item', [{
            itemName: '.item-name | clean',
            itemBrand: '.item-brand span | clean',
            itemCategory: '.item-category a | clean',
            categoryUrl: '.item-category a@href'
        }]),
        brands: x('#side_col .spotlight-user', '.avatar[data-page-track*=brand]', [{
            brandImage: 'a img@src',
            brandName: 'a@title',
            brandUrl: 'a@href'
        }])
    }).stream();
}

exports.getCategories = function(type) {
    x = initXray();
    return x(baseExploreUrl+type, '.square-window', [{
        categoryName: '.name | clean',
        categoryImage: 'img@src',
        categoryUrl: '.name | clean | lowercase | nodashnospace | exploreUrl'
    }]).stream();
}

exports.getLooksInCategory = function(category, gender = null) {
    x = initXray();

    if(gender !== null) {
        x = initXray().driver(nightmare({
            gender: gender
        }, selectGenderExplorePage));
    }
    
    return x(baseExploreUrl+category, '.look-square', [{
        lookName: '.look-title | clean',
        lookImage: 'img@src',
        lookId: '.hype@data-look-id',
        userId: '.fan-button@data-user-id',
        userName: '.user-action .action a | clean',
        userAvatar: '.user-avatar a img@src',
        userProfile: '.user-action .action a@href',
        items: x('.look-item-tags', ['li | clean'])
    }]).stream();
}

exports.getBrand = function(name) {
    x = initXray();
    return x(baseUrl+name, '.card', [{
        lookName: '.look-title | clean',
        lookImage: 'img@src',
        lookId: '.hype@data-look-id',
        lookUrl: '.hype@data-hype-url | BaseUrl',
        //userId: '.look-author a@href | userIdFromUrl',
        userName: '.look-author a | clean',
        userProfile: '.look-author a@href',
        items: x('.look-item-tags', ['li | clean'])
    }]).stream();
}

exports.getUser = function(userId) {
    x = initXray();
    console.log(baseUserUrl+userId);
    return x(baseUserUrl+userId, '#hg_wrapper', {
            userName: 'a[itemprop="name"]',
            userSmallDescription: 'p.byline | clean',
            userLongDescription: 'div[id="userabout"] | clean',
            userCountry: 'p.byline a | clean',
            userLinks : {
                lookbook: 'a[data-page-track*="user"]@href',
                instagram: 'a[data-page-track*="instagram"]@href',
                blog: 'a[data-page-track*="blog"]@href',
            },
           /* userStats: x(".profile_stats", {
                fans: 
                looks:
                likes: 
                karma: 
                following: 
            }, */
            looks: x('.user_content_container', '.no_top_margin:first-of-type .minilook', [{
                lookId: 'a@name',
                lookUrl: '.minilook_details a@href | BaseUrl',
                lookTitle: '.minilook_details a | clean',
                lookDescription: 'a.image@title | clean'
            }]),
            hypes: x('.user_content_container', '.no_top_margin:nth-of-type(3) .minilook', [{
                lookId: 'a@name',
                lookUrl: '.minilook_details a@href | BaseUrl',
                lookTitle: '.minilook_details a | clean',
                lookDescription: 'a.image@title | clean'
            }]),
    }).stream();
}