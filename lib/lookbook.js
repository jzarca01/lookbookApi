const nightmare = require('x-ray-nightmare');
const Xray = require('x-ray');
const baseUrl = "http://lookbook.nu/";
const baseLookUrl = "http://lookbook.nu/look/";

function initXray() {
    return x = Xray({
        filters: {
            clean: string => string.replace(/\n/g, '').trim(),
            cleanLookup : string => string.split("|")[1].trim(),
            paid: link => link.includes("shareasale.com"),
            getPaidUrl: link => {console.log("link", link); return (link.includes("shareasale.com")) ? link.split("urllink=")[1] : link },
            cleanPaidUrl: link => decodeURIComponent(link),
            lookbook : string => baseLookUrl + string
        }
    });
}

var exports = module.exports = {};

function selectGender(ctx, nightmare) {
    return nightmare
        .goto(ctx.url)
        .click(`a[data-gender="${nightmare.options.gender}"]`)
        //.screenshot("test.png")
        .wait();
}


exports.getLooks = function(path, place = '', gender = null) {
    x = initXray();
    if(place != '') {
        place = place+"/";
    }

    if(gender !== null) {
        x = initXray().driver(nightmare({
            gender: gender
        }, selectGender));
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