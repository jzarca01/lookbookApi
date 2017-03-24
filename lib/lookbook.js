const Xray = require('x-ray');
const baseUrl = "http://lookbook.nu/";
const baseLookUrl = "http://lookbook.nu/look/"
let x = Xray({
    filters: {
        clean: string => string.replace(/\n/g, '').trim(),
        cleanLookup : string => string.split("|")[1].trim(),
        paid: link => link.includes("shareasale.com"),
        getPaidUrl: link => (link.includes("shareasale.com")) ? link.split("urllink=")[1] : link,
        cleanPaidUrl: link => decodeURIComponent(link),
        lookbook : string => baseLookUrl + string
    }
});

var exports = module.exports = {};


exports.getLooks = function(path, place = '') {
    if(place != '') {
        place = place+"/";
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
    return x(baseLookUrl+lookId, '.look_main', {
        title: '.look-meta-container h1 | clean',
        imageUrl: '.look_photo a img@src',
        lookUrl: '#look_photo_container@data-page-track | cleanLookup | lookbook',
        description: '#look_descrip | clean',
        userAvatar: '.user-avatar img@src',
        realName: '.info .name a',
        profile: '.info .name a@href',
        items: x('.look-items-list ', '.item', [{
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