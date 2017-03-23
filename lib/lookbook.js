const Xray = require('x-ray');
const baseUrl = "http://lookbook.nu/";
const baseLookUrl = "http://lookbook.nu/look/"
let x = Xray({
    filters: {
        clean: string => string.replace(/\n/g, '').trim(),
        cleanLookup : string => string.split("|")[1].trim(),
        paid: link => link.includes("shareasale.com"),
        getPaidUrl: link => (link.includes("shareasale.com")) ? link.split("urllink=")[1] : link,
        cleanPaidUrl: link => decodeURIComponent(link)
    }
});

var exports = module.exports = {};


exports.getLooks = function(path, limit = 3) {
    return x(baseUrl+path, '#looks', {
        looks: x('.look_v2', [{
            user: '.name a',
            userUrl: '.name a@href',
            imageUrl : '.look_photo img@src',
            lookId: 'a@name',
            lookUrl: '.look_photo a@href'
        }])
    })
    .limit(limit).stream();
}

exports.getLook = function(lookId) {
    return x(baseLookUrl+lookId, '.look_main', {
        title: '.look-meta-container h1 | clean',
        imageUrl: '.look_photo a img@src',
        lookUrl: '#look_photo_container@data-page-track | cleanLookup',
        description: '#look_descrip | clean',
        userAvatar: '.user-avatar img@src',
        realName: '.info .name a',
        profile: '.info .name a@href',
        items: x('#side_col .look-items-list div', [{
            itemName: '.item-info .item-name a | clean',
            itemUrl: '.item-info .item-name a@href | getPaidUrl | cleanPaidUrl',
            isPaidLink: '.item-info .item-name a@href | paid',
            itemBrand: '.item-meta .item-brand span a | clean',
            itemBrandUrl: '.item-meta .item-brand span a@href',
            itemCategory: '.item-meta .item-category a | clean',
            itemCategoryUrl: '.item-meta .item-category a@href'
        }]),
        brands: x('#side_col .spotlight-user', [{
            brandImage: '.avatar a img@src',
            brandName: '.avatar a@title',
            brandUrl: '.avatar a@href'
        }])
    }).stream();
}