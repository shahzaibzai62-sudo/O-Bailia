/* =============================================
   O-BAILIA RESTAURANT — app.js
   House of Taste | Sanghar, Sindh
   No Firebase — Local admin auth
============================================= */
'use strict';

// ===== STATE =====
let menuItems = [];
let bookings  = [];
let cart      = [];
let currentMenuFilter  = 'all';
let currentOrderFilter = 'all';
let adminLoggedIn = false;
let settings  = { waNumber: '923357367364', deliveryCharge: 0 };
let selectedTableType = '';
let conversationHistory = [];

// Admin credentials (simple local check — no Firebase)
const ADMIN_USER = 'obailia';
const ADMIN_PASS = 'ob2025';

// ===== XSS HELPER =====
function sanitize(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

// ===== DEFAULT MENU — Full O-Bailia menu from images =====
function getDefaultMenu() {
  return [
    // ── VEGETABLE LOVER'S ──
    { name: 'Daal Mash',              category: 'Vegetable',  emoji: '🥘', desc: 'Creamy white lentil slow-cooked with butter & spices',                image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&q=80',  sizes: [{label:'Full', price:599}] },
    { name: 'Daal Makhni',            category: 'Vegetable',  emoji: '🥘', desc: 'Rich overnight slow-cooked black lentil with desi butter',              image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&q=80',  sizes: [{label:'Full', price:699}] },
    { name: 'Shahi Daal',             category: 'Vegetable',  emoji: '🥘', desc: 'Royal mixed lentil cooked in premium spices & cream',                   image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&q=80',  sizes: [{label:'Full', price:699}] },
    { name: 'Mix Vegetable',          category: 'Vegetable',  emoji: '🥗', desc: 'Garden fresh mixed vegetables cooked desi style',                       image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80', sizes: [{label:'Full', price:699}] },

    // ── GARAM TANDOOR ──
    { name: 'Tandoori Roti',          category: 'Tandoor',    emoji: '🫓', desc: 'Freshly baked whole-wheat roti from the clay tandoor',                  image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Each', price:30}] },
    { name: 'Plain Nan',              category: 'Tandoor',    emoji: '🫓', desc: 'Soft plain naan baked in traditional tandoor',                          image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Each', price:40}] },
    { name: 'Roghni Nan',             category: 'Tandoor',    emoji: '🫓', desc: 'Sesame-topped buttery roghni naan from the tandoor',                    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Each', price:65}] },
    { name: 'Garlic Nan',             category: 'Tandoor',    emoji: '🧄', desc: 'Flavourful garlic naan brushed with desi ghee',                         image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Each', price:65}] },
    { name: 'Puri Paratha',           category: 'Tandoor',    emoji: '🫓', desc: 'Flaky layered puri paratha — perfect with any curry',                   image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Each', price:70}] },
    { name: 'Chapati',                category: 'Tandoor',    emoji: '🫓', desc: 'Classic thin chapati from the traditional tandoor',                     image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Each', price:30}] },

    // ── SALAD & RAITA ──
    { name: 'Fresh Green Salad',      category: 'Salads',     emoji: '🥗', desc: 'Crisp garden greens with lemon dressing',                               image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', sizes: [{label:'Portion', price:149}] },
    { name: 'Chicken Pineapple Salad',category: 'Salads',     emoji: '🥗', desc: 'Grilled chicken with sweet pineapple & fresh greens',                   image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', sizes: [{label:'Portion', price:599}] },
    { name: 'Russian Salad',          category: 'Salads',     emoji: '🥗', desc: 'Creamy classic Russian salad with vegetables & mayo',                   image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', sizes: [{label:'Portion', price:599}] },
    { name: 'Mexican Chicken Salad',  category: 'Salads',     emoji: '🥗', desc: 'Spicy Mexican chicken salad with jalapeño & corn',                      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', sizes: [{label:'Portion', price:599}] },
    { name: 'Raita',                  category: 'Salads',     emoji: '🍶', desc: 'Cool yogurt raita with cumin & fresh herbs',                            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', sizes: [{label:'Portion', price:149}] },

    // ── BBQ ──
    { name: 'Tikka Boti (with Bone)', category: 'BBQ',        emoji: '🔴', desc: 'Classic bone-in chicken tikka marinated in special spices',             image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Half', price:499},{label:'Full', price:849}] },
    { name: 'Malai Boti',             category: 'BBQ',        emoji: '🤍', desc: 'Cream-marinated soft & juicy chicken malai boti',                       image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Half', price:599},{label:'Full', price:899}] },
    { name: 'Behari Boti',            category: 'BBQ',        emoji: '🔥', desc: 'Juicy Behari style boti with black pepper marinade',                    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&q=80', sizes: [{label:'Half', price:599},{label:'Full', price:899}] },
    { name: 'Shishtok Boti',          category: 'BBQ',        emoji: '🍢', desc: 'Tender shishtok skewer boti grilled to perfection',                     image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&q=80', sizes: [{label:'Half', price:599},{label:'Full', price:899}] },
    { name: 'Chicken Cheese Boti',    category: 'BBQ',        emoji: '🧀', desc: 'Cheese-stuffed chicken boti — extra indulgent',                         image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Half', price:649},{label:'Full', price:999}] },
    { name: 'Chicken Tikka Pcs',      category: 'BBQ',        emoji: '🍗', desc: 'Premium boneless chicken tikka pieces',                                 image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Full', price:449}] },
    { name: 'Chicken Malai Tikka',    category: 'BBQ',        emoji: '🤍', desc: 'Silky malai tikka — melt-in-mouth cream marinade',                      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Full', price:449}] },
    { name: 'Kalmi Tikka (6 Pcs)',    category: 'BBQ',        emoji: '🍗', desc: 'Six pieces of premium Kalmi tikka — bone-in drumlets',                  image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Full', price:999}] },
    { name: 'Chicken Kabab',          category: 'BBQ',        emoji: '🍢', desc: 'Classic spiced minced chicken kabab from the grill',                    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Full', price:699}] },
    { name: 'Reshmi Kabab',           category: 'BBQ',        emoji: '🍢', desc: 'Silky smooth reshmi kabab with cream & delicate spices',                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Full', price:799}] },
    { name: 'Gola Kabab',             category: 'BBQ',        emoji: '⚫', desc: 'Juicy round gola kabab with minced meat blend',                         image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&q=80', sizes: [{label:'Full', price:799}] },
    { name: 'Chicken Turkish Kabab',  category: 'BBQ',        emoji: '🇹🇷', desc: 'Authentic Turkish style chicken kabab with herbs',                     image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Full', price:799}] },
    { name: 'Labnese Kabab',          category: 'BBQ',        emoji: '🍢', desc: 'Lebanese-inspired spiced kabab with tangy marinade',                    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&q=80', sizes: [{label:'Full', price:999}] },
    { name: 'O-Bailia Special Kabab', category: 'BBQ',        emoji: '👑', desc: 'Our signature house special kabab — a must try',                        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Full', price:1099}] },
    { name: 'Mutton Seekh Kabab',     category: 'BBQ',        emoji: '🐑', desc: 'Slow-spiced minced mutton seekh kabab from the grill',                  image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&q=80', sizes: [{label:'Full', price:1399}] },
    { name: 'Mutton Turkish Kabab',   category: 'BBQ',        emoji: '🐑', desc: 'Turkish-style mutton kabab with smoky grill flavour',                   image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Full', price:1449}] },
    { name: 'Grill Fish (Kurara)',    category: 'BBQ',        emoji: '🐟', desc: 'Whole grilled Kurara fish marinated in secret spices',                  image: 'https://images.unsplash.com/photo-1536510233921-8e18a7b32e14?w=400&q=80', sizes: [{label:'Half', price:1799},{label:'Full', price:2999}] },

    // ── BBQ PLATTERS ──
    { name: 'BBQ Platter (Full)',     category: 'BBQ',        emoji: '🔥', desc: '4pc Kalmi + 4pc Malai Boti + Cheese Boti + Behari Boti + Tikka Boti + Reshmi Kabab + Chicken Kabab + Gola Kabab + Afghani Pulao + Puri Paratha + Naan + Salad + BBQ Sauce', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Full', price:4199}] },
    { name: 'BBQ Platter (Half)',     category: 'BBQ',        emoji: '🔥', desc: '2pc Kalmi + 2pc Malai Boti + Cheese Boti + Behari Boti + Tikka Boti + Reshmi Kabab + Chicken Kabab + Gola Kabab + Afghani Pulao + Puri Paratha + Naan + Salad + BBQ Sauce', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Half', price:2499}] },
    { name: 'BBQ Mini Platter',       category: 'BBQ',        emoji: '🔥', desc: '1pc Chicken Tikka + 1pc Turkish Kabab + Malai Boti + Behari Boti + Tikka Boti + Reshmi Kabab + Afghani Pulao + Salad + BBQ Sauce', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Mini', price:1799}] },

    // ── MANDI SPECIAL ──
    { name: 'Mutton Mandi With Rice', category: 'Mandi',      emoji: '🐑', desc: 'Slow-cooked whole mutton mandi served on fragrant rice',               image: 'https://images.unsplash.com/photo-1631515242808-497c3fbd5b49?w=400&q=80', sizes: [{label:'Full', price:3999}] },
    { name: 'Mutton Joint With Rice', category: 'Mandi',      emoji: '🐑', desc: 'Tender mutton joint mandi with saffron rice',                          image: 'https://images.unsplash.com/photo-1631515242808-497c3fbd5b49?w=400&q=80', sizes: [{label:'Full', price:1599}] },
    { name: 'Chicken Mandi With Rice',category: 'Mandi',      emoji: '🍗', desc: 'Whole chicken mandi slow-roasted & served on Yemeni rice',             image: 'https://images.unsplash.com/photo-1631515242808-497c3fbd5b49?w=400&q=80', sizes: [{label:'Full', price:1999}] },
    { name: 'Chicken Chargah',        category: 'Mandi',      emoji: '🍗', desc: 'Whole deep-fried spiced Chargah chicken — Lahori classic',             image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', sizes: [{label:'Full', price:1399}] },

    // ── CHICKEN KARAHI ──
    { name: 'Chicken Regular Karahi', category: 'Karahi',     emoji: '🌶️', desc: 'Classic spicy chicken karahi with fresh tomatoes & green chillies',    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80', sizes: [{label:'Half', price:1199},{label:'Full', price:2299}] },
    { name: 'Chicken Shanwari Karahi',category: 'Karahi',     emoji: '🌶️', desc: 'Peshawar-style Shanwari karahi with thick gravy & whole spices',       image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80', sizes: [{label:'Half', price:1199},{label:'Full', price:2299}] },
    { name: 'Chicken Green Karahi',   category: 'Karahi',     emoji: '💚', desc: 'Herb-rich green karahi with coriander & mint masala',                   image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80', sizes: [{label:'Half', price:1199},{label:'Full', price:2299}] },
    { name: 'Chicken Peshawari Karahi',category:'Karahi',     emoji: '🌶️', desc: 'Authentic Peshawari karahi — bold flavour with desi ghee',              image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80', sizes: [{label:'Half', price:1199},{label:'Full', price:2299}] },
    { name: 'Chicken Butt Karahi',    category: 'Karahi',     emoji: '🔴', desc: 'Lahori Butt-style karahi with special spice blend',                    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80', sizes: [{label:'Half', price:1249},{label:'Full', price:2349}] },
    { name: 'Chicken White Karahi',   category: 'Karahi',     emoji: '🤍', desc: 'Creamy white karahi with yogurt base & mild spices',                    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Half', price:1249},{label:'Full', price:2349}] },

    // ── MUTTON KARAHI ──
    { name: 'Mutton Regular Karahi',  category: 'Karahi',     emoji: '🐑', desc: 'Classic slow-cooked mutton karahi with desi masala',                   image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80', sizes: [{label:'Half', price:1999},{label:'Full', price:3699}] },
    { name: 'Mutton Shanwari Karahi', category: 'Karahi',     emoji: '🐑', desc: 'Peshawar-style mutton Shanwari karahi',                                 image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80', sizes: [{label:'Half', price:1999},{label:'Full', price:3699}] },
    { name: 'Mutton Peshawari Karahi',category: 'Karahi',     emoji: '🐑', desc: 'Authentic Peshawari slow-cooked mutton karahi',                         image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80', sizes: [{label:'Half', price:1999},{label:'Full', price:3699}] },
    { name: 'Mutton Brown Karahi',    category: 'Karahi',     emoji: '🐑', desc: 'Rich brown mutton karahi with caramelised onion base',                  image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80', sizes: [{label:'Half', price:1999},{label:'Full', price:3699}] },
    { name: 'Mutton Green Karahi',    category: 'Karahi',     emoji: '💚', desc: 'Herb-loaded green mutton karahi with fresh coriander',                  image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80', sizes: [{label:'Half', price:1999},{label:'Full', price:3699}] },
    { name: 'Mutton White Karahi',    category: 'Karahi',     emoji: '🤍', desc: 'Creamy white mutton karahi in yogurt & cream gravy',                    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Half', price:2099},{label:'Full', price:3799}] },
    { name: 'Mutton Butt Karahi',     category: 'Karahi',     emoji: '🔴', desc: 'Lahori Butt-style mutton karahi — rich & bold',                        image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80', sizes: [{label:'Half', price:2099},{label:'Full', price:3799}] },

    // ── CHICKEN HANDI ──
    { name: 'O-Bailia Special Handi', category: 'Handi',      emoji: '👑', desc: 'Our signature handi — house special recipe you will love',              image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Half', price:1299},{label:'Full', price:2299}] },
    { name: 'Chicken Handi',          category: 'Handi',      emoji: '🫕', desc: 'Classic chicken handi slow-cooked in clay pot with desi spices',        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Half', price:1199},{label:'Full', price:2199}] },
    { name: 'Chicken Achari Handi',   category: 'Handi',      emoji: '🫕', desc: 'Tangy pickle-spiced chicken handi with mustard seeds',                  image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Half', price:1199},{label:'Full', price:2199}] },
    { name: 'Chicken White Handi',    category: 'Handi',      emoji: '🤍', desc: 'Creamy white chicken handi in rich yogurt & cream base',                image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Half', price:1249},{label:'Full', price:2299}] },
    { name: 'Chicken Makhni Handi',   category: 'Handi',      emoji: '🧈', desc: 'Velvety butter makhni chicken handi — silky rich gravy',                image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&q=80', sizes: [{label:'Half', price:1249},{label:'Full', price:2299}] },
    { name: 'Chicken Hari Mirch',     category: 'Handi',      emoji: '🌶️', desc: 'Fiery chicken with whole green chillies & bold spices',                 image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:1399}] },
    { name: 'Chicken Ginger',         category: 'Handi',      emoji: '🫚', desc: 'Chicken cooked with aromatic fresh ginger paste',                       image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:1399}] },
    { name: 'Chicken Bharta',         category: 'Handi',      emoji: '🫕', desc: 'Smoked chicken bharta with roasted eggplant & spices',                  image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:1399}] },
    { name: 'Kabab Masala',           category: 'Handi',      emoji: '🍢', desc: 'Soft kabab cooked in spicy masala gravy',                               image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', sizes: [{label:'Full', price:999}] },

    // ── MUTTON HANDI ──
    { name: 'Mutton Handi (with Bone)',      category: 'Handi', emoji: '🐑', desc: 'Bone-in mutton slow-cooked in clay pot with aromatic spices',         image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80', sizes: [{label:'Half', price:2049},{label:'Full', price:3499}] },
    { name: 'Mutton White Handi (with Bone)',category: 'Handi', emoji: '🤍', desc: 'Creamy white bone-in mutton handi in yogurt base',                    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Half', price:2099},{label:'Full', price:3599}] },

    // ── BIRYANI ──
    { name: 'Chicken Dum Biryani',    category: 'Biryani',    emoji: '🍗', desc: 'Authentic slow-dum chicken biryani with saffron & whole spices',        image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&q=80', sizes: [{label:'Half', price:1049},{label:'Full', price:1799}] },
    { name: 'Chicken Matka Biryani',  category: 'Biryani',    emoji: '🍗', desc: 'Sealed clay matka biryani — flavours locked in perfection',             image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&q=80', sizes: [{label:'Half', price:949},{label:'Full', price:1549}] },
    { name: 'Chicken Degi Biryani',   category: 'Biryani',    emoji: '🍗', desc: 'Large-pot Degi biryani — restaurant-style slow cooked',                 image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&q=80', sizes: [{label:'Full', price:2599}] },
    { name: 'Mutton Matka Biryani',   category: 'Biryani',    emoji: '🐑', desc: 'Tender mutton sealed in clay matka biryani',                            image: 'https://images.unsplash.com/photo-1631515242808-497c3fbd5b49?w=400&q=80', sizes: [{label:'Half', price:1499},{label:'Full', price:2799}] },
    { name: 'Vegetable Biryani',      category: 'Biryani',    emoji: '🥗', desc: 'Garden-fresh vegetable dum biryani — flavourful & hearty',              image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80', sizes: [{label:'Half', price:749},{label:'Full', price:1299}] },
    { name: 'Afghani Pulao',          category: 'Biryani',    emoji: '🏔️', desc: 'Authentic Kabuli Afghani pulao with raisins & carrots',                 image: 'https://images.unsplash.com/photo-1631515242808-497c3fbd5b49?w=400&q=80', sizes: [{label:'Full', price:899}] },

    // ── PASTA ──
    { name: 'Lasagna Pasta',          category: 'Pasta',      emoji: '🍝', desc: 'Layered lasagna with meat sauce & béchamel',                           image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80', sizes: [{label:'Half', price:599},{label:'Full', price:999}] },
    { name: 'Flaming Pasta',          category: 'Pasta',      emoji: '🔥', desc: 'Spicy flaming pasta with fire sauce & chicken',                        image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80', sizes: [{label:'Half', price:549},{label:'Full', price:949}] },
    { name: 'Crunch Pasta',           category: 'Pasta',      emoji: '🍝', desc: 'Crispy-topped pasta with creamy chicken filling',                      image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80', sizes: [{label:'Half', price:549},{label:'Full', price:949}] },
    { name: 'Chicken Pasta',          category: 'Pasta',      emoji: '🍝', desc: 'Classic chicken pasta in a rich tomato-cream sauce',                   image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80', sizes: [{label:'Full', price:949}] },
    { name: 'Mexican Pasta',          category: 'Pasta',      emoji: '🌮', desc: 'Spicy Mexican-inspired pasta with jalapeños & corn',                   image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80', sizes: [{label:'Full', price:899}] },
    { name: 'White Pepper Pasta',     category: 'Pasta',      emoji: '🍝', desc: 'Creamy white pepper pasta with a mild peppery kick',                   image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80', sizes: [{label:'Full', price:999}] },
    { name: 'Mushroom Sauce Pasta',   category: 'Pasta',      emoji: '🍄', desc: 'Silky mushroom cream sauce pasta — earthy & rich',                     image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80', sizes: [{label:'Full', price:999}] },

    // ── STEAKS ──
    { name: 'O-Bailia Cheese Steak With Fried Rice', category: 'Steaks', emoji: '🥩', desc: 'House cheese steak served with golden fried rice',          image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80', sizes: [{label:'Full', price:1299}] },
    { name: 'Mexican Steak With Fried Rice',          category: 'Steaks', emoji: '🌮', desc: 'Spicy Mexican-style steak with flavourful fried rice',      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80', sizes: [{label:'Full', price:1249}] },
    { name: 'American Steak With Fried Rice',         category: 'Steaks', emoji: '🥩', desc: 'Classic American steak with perfectly seasoned fried rice', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80', sizes: [{label:'Full', price:1249}] },
    { name: 'Tarragon Steak With Fried Rice',         category: 'Steaks', emoji: '🌿', desc: 'Herb-marinated tarragon steak served with fried rice',      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80', sizes: [{label:'Full', price:1249}] },
    { name: 'Chicken Steak With Fried Rice',          category: 'Steaks', emoji: '🍗', desc: 'Grilled chicken steak served with seasoned fried rice',     image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80', sizes: [{label:'Full', price:1149}] },

    // ── CHINESE ──
    { name: 'Chicken Shashlik With Fried Rice',        category: 'Chinese', emoji: '🍢', desc: 'Grilled chicken shashlik skewers with golden fried rice', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:999}] },
    { name: 'Chicken Manchurian With Fried Rice',      category: 'Chinese', emoji: '🍜', desc: 'Crispy chicken Manchurian balls in soy-ginger sauce',      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:999}] },
    { name: 'Black Pepper Chicken With Fried Rice',    category: 'Chinese', emoji: '🌶️', desc: 'Aromatic black pepper chicken stir-fry with fried rice',  image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:999}] },
    { name: 'Chicken Chilli Dry With Fried Rice',      category: 'Chinese', emoji: '🌶️', desc: 'Dry chilli chicken toss with peppers & onions',           image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:999}] },
    { name: 'Kung Pao Chicken With Fried Rice',        category: 'Chinese', emoji: '🥜', desc: 'Kung Pao chicken with peanuts & Szechuan spice',           image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:999}] },
    { name: 'Singapuri Rice',                          category: 'Chinese', emoji: '🍚', desc: 'Spicy Singapore-style mixed fried rice',                   image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:999}] },
    { name: 'Fish Chilli Dry With Fried Rice',         category: 'Chinese', emoji: '🐟', desc: 'Crispy fish in tangy chilli dry sauce with fried rice',    image: 'https://images.unsplash.com/photo-1536510233921-8e18a7b32e14?w=400&q=80', sizes: [{label:'Full', price:1199}] },
    { name: 'Chicken Chowmein',                        category: 'Chinese', emoji: '🍜', desc: 'Classic stir-fried chicken chow mein noodles',             image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400&q=80', sizes: [{label:'Full', price:899}] },
    { name: 'Vegetable Chow Mein',                     category: 'Chinese', emoji: '🥗', desc: 'Fresh vegetable stir-fried chow mein noodles',             image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400&q=80', sizes: [{label:'Full', price:499}] },

    // ── FRIED RICE ──
    { name: 'Plain Steam Rice',       category: 'Rice',       emoji: '🍚', desc: 'Perfectly steamed plain basmati rice',                                  image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:399}] },
    { name: 'Egg Fried Rice',         category: 'Rice',       emoji: '🥚', desc: 'Classic egg fried rice with spring onions',                             image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:499}] },
    { name: 'Vegetable Rice',         category: 'Rice',       emoji: '🥗', desc: 'Light & healthy vegetable fried rice',                                  image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:499}] },
    { name: 'Chicken Fried Rice',     category: 'Rice',       emoji: '🍗', desc: 'Wok-tossed chicken fried rice with soy seasoning',                     image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:549}] },
    { name: 'Chicken Masala Rice',    category: 'Rice',       emoji: '🍗', desc: 'Spiced chicken masala rice — desi fusion',                              image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:699}] },

    // ── APPETIZERS ──
    { name: 'Fish Cracker',           category: 'Appetizers', emoji: '🐟', desc: 'Light crispy fish crackers — perfect starter',                         image: 'https://images.unsplash.com/photo-1536510233921-8e18a7b32e14?w=400&q=80', sizes: [{label:'Portion', price:299}] },
    { name: 'Spicy Wings (6 Pcs)',    category: 'Appetizers', emoji: '🌶️', desc: 'Six pieces of fiery spicy chicken wings',                               image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', sizes: [{label:'Portion', price:649}] },
    { name: 'Sesame Honey Wings (6 Pcs)',category:'Appetizers',emoji: '🍯', desc: 'Sweet sesame honey glazed crispy chicken wings',                       image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', sizes: [{label:'Portion', price:749}] },
    { name: 'Drum Stick (4 Pcs)',     category: 'Appetizers', emoji: '🍗', desc: 'Crispy golden chicken drumsticks — 4 pieces',                          image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', sizes: [{label:'Portion', price:749}] },
    { name: 'Dhaka Chicken',          category: 'Appetizers', emoji: '🍗', desc: 'Special Dhaka-style whole chicken with unique spice blend',             image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', sizes: [{label:'Full', price:999}] },
    { name: 'Fish & Chips (4 Pcs)',   category: 'Appetizers', emoji: '🐟', desc: 'Golden battered fish with crispy chips — 4 pieces',                    image: 'https://images.unsplash.com/photo-1536510233921-8e18a7b32e14?w=400&q=80', sizes: [{label:'Portion', price:1099}] },
    { name: 'Finger Fish (6 Pcs)',    category: 'Appetizers', emoji: '🐟', desc: 'Crispy fish fingers with tartar sauce — 6 pieces',                     image: 'https://images.unsplash.com/photo-1536510233921-8e18a7b32e14?w=400&q=80', sizes: [{label:'Portion', price:1099}] },
    { name: 'Dhaka Fish',             category: 'Appetizers', emoji: '🐟', desc: 'Dhaka-style whole spiced fried fish',                                  image: 'https://images.unsplash.com/photo-1536510233921-8e18a7b32e14?w=400&q=80', sizes: [{label:'Full', price:1099}] },

    // ── SOUP ──
    { name: 'O-Bailia Special Soup',  category: 'Soups',      emoji: '🍲', desc: 'Signature house soup with fish cracker — chef\'s secret recipe',       image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80', sizes: [{label:'Single', price:349},{label:'Full', price:949}] },
    { name: 'Hot & Sour Soup',        category: 'Soups',      emoji: '🌶️', desc: 'Chinese hot & sour soup with fish cracker',                            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80', sizes: [{label:'Single', price:299},{label:'Full', price:899}] },
    { name: 'Chicken Corn Soup',      category: 'Soups',      emoji: '🌽', desc: 'Creamy chicken & sweet corn soup with fish cracker',                    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80', sizes: [{label:'Single', price:299},{label:'Full', price:899}] },
    { name: 'Schezwan Soup',          category: 'Soups',      emoji: '🌶️', desc: 'Fiery Schezwan soup with bold chilli sauce & fish cracker',             image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80', sizes: [{label:'Single', price:299},{label:'Full', price:899}] },
    { name: 'Vegetable Soup',         category: 'Soups',      emoji: '🥗', desc: 'Light vegetable soup served with fish cracker',                         image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80', sizes: [{label:'Single', price:249},{label:'Full', price:699}] },

    // ── FRIED ITEMS ──
    { name: 'Nuggets (5 Pcs)',        category: 'Fried',      emoji: '🍗', desc: 'Crispy golden chicken nuggets — 5 pieces',                             image: 'https://images.unsplash.com/photo-1627308595171-d1b5d67129c4?w=400&q=80', sizes: [{label:'Full', price:549}] },
    { name: 'Hot Shot (8 Pcs)',       category: 'Fried',      emoji: '🌶️', desc: 'Spicy hot shot chicken bites — 8 pieces',                              image: 'https://images.unsplash.com/photo-1627308595171-d1b5d67129c4?w=400&q=80', sizes: [{label:'Full', price:549}] },
    { name: 'Chicken Broast (Quarter)',category:'Fried',       emoji: '🍗', desc: 'Pressure-fried golden crispy quarter chicken broast',                  image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', sizes: [{label:'Quarter', price:529}] },
    { name: 'Crispy Wings (8 Pcs)',   category: 'Fried',      emoji: '🍗', desc: 'Extra crispy chicken wings — 8 pieces',                                image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', sizes: [{label:'Full', price:699}] },

    // ── FRIES ──
    { name: 'Regular Fries',          category: 'Fries',      emoji: '🍟', desc: 'Golden crispy regular cut fries with ketchup',                         image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80', sizes: [{label:'Portion', price:299}] },
    { name: 'Masala Fries',           category: 'Fries',      emoji: '🌶️', desc: 'Spicy masala-seasoned crispy fries',                                   image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80', sizes: [{label:'Portion', price:299}] },
    { name: 'Loaded Fries',           category: 'Fries',      emoji: '🧀', desc: 'Fries loaded with cheese sauce & toppings',                            image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80', sizes: [{label:'Portion', price:499}] },
    { name: 'Pizza Fries',            category: 'Fries',      emoji: '🍕', desc: 'Pizza-flavoured fries with mozzarella & herbs',                        image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80', sizes: [{label:'Portion', price:549}] },

    // ── BURGERS ──
    { name: 'King Crunch Burger',     category: 'Burgers',    emoji: '👑', desc: 'King-sized crunch burger — fully loaded premium',                      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', sizes: [{label:'Single', price:699}] },
    { name: 'Mighty Burger',          category: 'Burgers',    emoji: '💪', desc: 'Mighty double-stack burger with special sauce',                        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', sizes: [{label:'Single', price:649}] },
    { name: 'Lava Burger',            category: 'Burgers',    emoji: '🌋', desc: 'Burger with molten cheese lava filling — irresistible',                image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Single', price:599}] },
    { name: 'Pizza Burger',           category: 'Burgers',    emoji: '🍕', desc: 'Fusion pizza-burger with mozzarella & Italian herbs',                  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', sizes: [{label:'Single', price:599}] },
    { name: 'Crispy Zinger Burger',   category: 'Burgers',    emoji: '🍔', desc: 'Crispy zinger fillet burger with signature spicy sauce',               image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', sizes: [{label:'Single', price:529}] },
    { name: 'Tikka Burger',           category: 'Burgers',    emoji: '🔴', desc: 'Spiced chicken tikka patty burger with mint chutney',                  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', sizes: [{label:'Single', price:449}] },
    { name: 'Chicken Chapli Burger',  category: 'Burgers',    emoji: '🍔', desc: 'Peshawari chapli-spiced chicken patty burger',                         image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', sizes: [{label:'Single', price:449}] },
    { name: 'Chicken Burger',         category: 'Burgers',    emoji: '🍔', desc: 'Classic grilled chicken burger with fresh veggies',                    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', sizes: [{label:'Single', price:399}] },

    // ── SANDWICHES ──
    { name: 'Tacos Sandwich',         category: 'Sandwiches', emoji: '🌮', desc: 'Mexican-style tacos sandwich with spicy filling',                      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', sizes: [{label:'Single', price:699}] },
    { name: 'O-Bailia Special Sandwich',category:'Sandwiches',emoji: '👑', desc: 'Signature house special sandwich — our chef\'s pride',                 image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', sizes: [{label:'Single', price:599}] },
    { name: 'Mexican Sandwich',       category: 'Sandwiches', emoji: '🌮', desc: 'Spicy Mexican chicken sandwich with jalapeños',                        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', sizes: [{label:'Single', price:599}] },
    { name: 'BBQ Sandwich',           category: 'Sandwiches', emoji: '🍖', desc: 'Smoky BBQ chicken sandwich with coleslaw',                             image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', sizes: [{label:'Single', price:499}] },
    { name: 'Crunch Sandwich',        category: 'Sandwiches', emoji: '🥪', desc: 'Extra-crispy crunch chicken sandwich',                                 image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', sizes: [{label:'Single', price:499}] },
    { name: 'Club Sandwich',          category: 'Sandwiches', emoji: '🥪', desc: 'Classic triple-layer club sandwich with chicken & egg',                image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', sizes: [{label:'Single', price:479}] },
    { name: 'Vegetable Sandwich',     category: 'Sandwiches', emoji: '🥗', desc: 'Fresh garden vegetable sandwich — light & healthy',                    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', sizes: [{label:'Single', price:399}] },

    // ── PIZZA — SPECIAL ──
    { name: 'OB Special Special Pizza',category:'Pizza',      emoji: '🍕', desc: 'O-Bailia\'s signature pizza with premium toppings',                    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Medium', price:999},{label:'Large', price:1499}] },
    { name: 'Crown Crust Pizza',      category: 'Pizza',      emoji: '👑', desc: 'Stuffed-crust crown pizza with melted cheese edge',                    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Medium', price:999},{label:'Large', price:1499}] },
    { name: 'Kabab Crust Pizza',      category: 'Pizza',      emoji: '🍢', desc: 'Unique kabab-stuffed crust pizza',                                     image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Medium', price:999},{label:'Large', price:1499}] },
    { name: 'Lazania Pizza',          category: 'Pizza',      emoji: '🍝', desc: 'Lasagna-inspired pizza with creamy meat sauce',                        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Medium', price:999},{label:'Large', price:1499}] },
    { name: 'Calzone Pizza',          category: 'Pizza',      emoji: '🍕', desc: 'Folded Italian calzone stuffed with cheese & chicken',                 image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Medium', price:999},{label:'Large', price:1499}] },
    { name: 'Crispy Chicken Pizza',   category: 'Pizza',      emoji: '🍗', desc: 'Crispy fried chicken topped pizza with smoky sauce',                   image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Small', price:599},{label:'Medium', price:999},{label:'Large', price:1499}] },
    { name: 'Supreme Pizza',          category: 'Pizza',      emoji: '👑', desc: 'Fully loaded supreme pizza with all premium toppings',                 image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Small', price:599},{label:'Medium', price:999},{label:'Large', price:1499}] },
    { name: 'Kababish Pizza',         category: 'Pizza',      emoji: '🍢', desc: 'Minced kabab topping pizza with desi spice blend',                     image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Small', price:599},{label:'Medium', price:999},{label:'Large', price:1499}] },
    { name: 'Malai Boti Pizza',       category: 'Pizza',      emoji: '🤍', desc: 'Creamy malai boti topping pizza — fusion delight',                     image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Small', price:599},{label:'Medium', price:999},{label:'Large', price:1499}] },

    // ── PIZZA — REGULAR ──
    { name: 'Tikka Pizza',            category: 'Pizza',      emoji: '🔴', desc: 'Marinated tikka chicken topping on a cheesy pizza base',               image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Small', price:549},{label:'Medium', price:849},{label:'Large', price:1349}] },
    { name: 'Fajita Pizza',           category: 'Pizza',      emoji: '🌮', desc: 'Mexican fajita-style pizza with peppers & onions',                     image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Small', price:549},{label:'Medium', price:849},{label:'Large', price:1349}] },
    { name: 'Bonfire Pizza',          category: 'Pizza',      emoji: '🔥', desc: 'Smoky bonfire-flavour pizza with BBQ base',                            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Small', price:549},{label:'Medium', price:849},{label:'Large', price:1349}] },
    { name: 'Cheese Lover Pizza',     category: 'Pizza',      emoji: '🧀', desc: 'Triple cheese overload pizza — a cheese lover\'s dream',               image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Small', price:499},{label:'Medium', price:799},{label:'Large', price:1299}] },
    { name: 'Vegetable Pizza',        category: 'Pizza',      emoji: '🥗', desc: 'Fresh garden vegetable pizza on golden crust',                         image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Small', price:499},{label:'Medium', price:799},{label:'Large', price:1299}] },

    // ── PANEER SPECIAL ──
    { name: 'Paneer Pizza',           category: 'Paneer',     emoji: '🧀', desc: 'Soft paneer cheese topping on a crispy pizza base',                    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Small', price:599},{label:'Medium', price:999},{label:'Large', price:1499}] },
    { name: 'Paneer Burger',          category: 'Paneer',     emoji: '🍔', desc: 'Spiced grilled paneer patty burger',                                   image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', sizes: [{label:'Single', price:599}] },
    { name: 'Paneer Sandwich',        category: 'Paneer',     emoji: '🥪', desc: 'Fresh paneer sandwich with mint chutney',                              image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', sizes: [{label:'Single', price:599}] },
    { name: 'Dhaka Paneer',           category: 'Paneer',     emoji: '🧀', desc: 'Dhaka-style spiced whole paneer — aromatic & rich',                    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:1099}] },
    { name: 'Paneer Chili Dry With Fried Rice', category: 'Paneer', emoji: '🌶️', desc: 'Crispy paneer in dry chilli sauce with fried rice',             image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:1099}] },
    { name: 'Paneer Shakhlik With Fried Rice',  category: 'Paneer', emoji: '🍢', desc: 'Paneer shashlik skewers served with golden fried rice',          image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:1099}] },
    { name: 'Paneer Handi',           category: 'Paneer',     emoji: '🫕', desc: 'Soft paneer in rich spiced handi gravy',                               image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:1399}] },
    { name: 'Paneer Reshmi Handi',    category: 'Paneer',     emoji: '🤍', desc: 'Creamy reshmi paneer handi with silky gravy',                          image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:1399}] },
    { name: 'Paneer Achari Handi',    category: 'Paneer',     emoji: '🫙', desc: 'Tangy pickle-spiced paneer handi',                                     image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', sizes: [{label:'Full', price:1399}] },
    { name: 'Paneer Karahi',          category: 'Paneer',     emoji: '🌶️', desc: 'Spicy paneer karahi in fresh tomato base',                             image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80', sizes: [{label:'Half', price:1599},{label:'Full', price:2999}] },
    { name: 'Paneer Biryani',         category: 'Paneer',     emoji: '🍚', desc: 'Aromatic paneer dum biryani with saffron & whole spices',              image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&q=80', sizes: [{label:'Half', price:1049},{label:'Full', price:1799}] },

    // ── ROLLS & PARATHA ──
    { name: 'Malai Boti Roll',        category: 'Rolls',      emoji: '🌯', desc: 'Creamy malai boti wrapped in fresh paratha — Chatni Rs.269 / Mayo Rs.279', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80', sizes: [{label:'Chatni', price:269},{label:'Mayo', price:279}] },
    { name: 'Behari Roll',            category: 'Rolls',      emoji: '🌯', desc: 'Juicy Behari boti roll — Chatni Rs.269 / Mayo Rs.279',                 image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80', sizes: [{label:'Chatni', price:269},{label:'Mayo', price:279}] },
    { name: 'Chicken Chatni Roll',    category: 'Rolls',      emoji: '🌯', desc: 'Spicy chicken chatni roll — Chatni Rs.269 / Mayo Rs.279',              image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80', sizes: [{label:'Chatni', price:269},{label:'Mayo', price:279}] },
    { name: 'Zinger Roll',            category: 'Rolls',      emoji: '🌯', desc: 'Crispy zinger chicken roll — Chatni Rs.269 / Mayo Rs.279',             image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80', sizes: [{label:'Chatni', price:269},{label:'Mayo', price:279}] },
    { name: 'Kabab Roll',             category: 'Rolls',      emoji: '🌯', desc: 'Spiced kabab roll — Chatni Rs.269 / Mayo Rs.279',                      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80', sizes: [{label:'Chatni', price:269},{label:'Mayo', price:279}] },
    { name: 'Vegetable Roll',         category: 'Rolls',      emoji: '🥗', desc: 'Fresh vegetable roll — Chatni Rs.189 / Mayo Rs.199',                   image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80', sizes: [{label:'Chatni', price:189},{label:'Mayo', price:199}] },
    { name: 'Chicken Cheese Paratha', category: 'Rolls',      emoji: '🫓', desc: 'Flaky paratha stuffed with spiced chicken & melted cheese',            image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Each', price:449}] },
    { name: 'Chicken Paratha',        category: 'Rolls',      emoji: '🫓', desc: 'Classic spiced chicken paratha — comfort food favourite',              image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Each', price:399}] },
    { name: 'Aloo Paratha',           category: 'Rolls',      emoji: '🥔', desc: 'Traditional spiced potato-stuffed aloo paratha',                      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', sizes: [{label:'Each', price:269}] },

    // ── SAUCES ──
    { name: 'Garlic Mayo Sauce',      category: 'Extras',     emoji: '🧄', desc: 'Creamy garlic mayonnaise dipping sauce',                               image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80', sizes: [{label:'Portion', price:80}] },
    { name: 'Chipotle Sauce',         category: 'Extras',     emoji: '🌶️', desc: 'Smoky chipotle sauce with a spicy kick',                               image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80', sizes: [{label:'Portion', price:80}] },
    { name: 'Creamy BBQ Sauce',       category: 'Extras',     emoji: '🍖', desc: 'Rich creamy BBQ dipping sauce',                                        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80', sizes: [{label:'Portion', price:80}] },

    // ── MOCKTAILS ──
    { name: 'Mint Margarita',         category: 'Beverages',  emoji: '🍃', desc: 'Refreshing mint margarita mocktail',                                   image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:259}] },
    { name: 'Blue Berry Margarita',   category: 'Beverages',  emoji: '🫐', desc: 'Sweet blueberry margarita mocktail',                                   image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:259}] },
    { name: 'Peach Margarita',        category: 'Beverages',  emoji: '🍑', desc: 'Fruity peach margarita mocktail',                                      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:259}] },
    { name: 'Strawberry Margarita',   category: 'Beverages',  emoji: '🍓', desc: 'Classic strawberry margarita mocktail',                                image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:259}] },
    { name: 'Pina Colada',            category: 'Beverages',  emoji: '🍍', desc: 'Tropical pineapple & coconut Pina Colada',                             image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:349}] },
    { name: 'Strawberry Colada',      category: 'Beverages',  emoji: '🍓', desc: 'Creamy strawberry colada mocktail',                                    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:349}] },
    { name: 'Blue Berry Colada',      category: 'Beverages',  emoji: '🫐', desc: 'Rich blueberry colada mocktail',                                       image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:349}] },
    { name: 'Strawberry Smoothie',    category: 'Beverages',  emoji: '🍓', desc: 'Fresh & creamy strawberry smoothie',                                   image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:399}] },
    { name: 'Peach Smoothie',         category: 'Beverages',  emoji: '🍑', desc: 'Smooth & fruity peach smoothie',                                       image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:399}] },

    // ── MILK SHAKES ──
    { name: 'Dry Fruit Shake',        category: 'Milkshakes', emoji: '🥜', desc: 'Premium dry fruit milkshake — rich & nutritious',                      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:499}] },
    { name: 'Injeer Shake',           category: 'Milkshakes', emoji: '🌿', desc: 'Healthy fig (Injeer) milkshake — sweet & creamy',                      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:499}] },
    { name: 'Kajhoor Shake',          category: 'Milkshakes', emoji: '🌴', desc: 'Date (Kajhoor) milkshake — naturally sweet & thick',                   image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:399}] },
    { name: 'Banana Shake',           category: 'Milkshakes', emoji: '🍌', desc: 'Classic creamy banana milkshake',                                      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:299}] },
    { name: 'Pineapple Shake',        category: 'Milkshakes', emoji: '🍍', desc: 'Tropical pineapple milkshake — refreshing & sweet',                    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:349}] },
    { name: 'Strawberry Shake',       category: 'Milkshakes', emoji: '🍓', desc: 'Sweet & creamy strawberry milkshake',                                  image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:349}] },
    { name: 'Mango Shake',            category: 'Milkshakes', emoji: '🥭', desc: 'Thick & luscious mango milkshake',                                     image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:349}] },
    { name: 'Vanilla Shake',          category: 'Milkshakes', emoji: '🍦', desc: 'Smooth classic vanilla milkshake',                                     image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:349}] },
    { name: 'Chocolate Shake',        category: 'Milkshakes', emoji: '🍫', desc: 'Rich & indulgent chocolate milkshake',                                 image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:349}] },
    { name: 'Oreo Shake',             category: 'Milkshakes', emoji: '🍪', desc: 'Creamy Oreo cookie blended milkshake',                                 image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:399}] },
    { name: 'KitKat Shake',           category: 'Milkshakes', emoji: '🍫', desc: 'Indulgent KitKat chocolate milkshake',                                 image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:449}] },

    // ── HOT DRINKS ──
    { name: 'Green Tea',              category: 'Hot Drinks', emoji: '🍵', desc: 'Soothing natural green tea',                                            image: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=400&q=80', sizes: [{label:'Cup', price:79}] },
    { name: 'Doodh Pati Chai',        category: 'Hot Drinks', emoji: '☕', desc: 'Traditional creamy all-milk Pakistani chai',                            image: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=400&q=80', sizes: [{label:'Cup', price:100}] },
    { name: 'Tea in Disposable Cane', category: 'Hot Drinks', emoji: '☕', desc: 'Refreshing tea served in traditional sugarcane glass',                  image: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=400&q=80', sizes: [{label:'Glass', price:120}] },
    { name: 'Coffee',                 category: 'Hot Drinks', emoji: '☕', desc: 'Rich freshly brewed coffee',                                            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80', sizes: [{label:'Cup', price:299}] },

    // ── COLD BEVERAGES ──
    { name: 'Mineral Water Large',    category: 'Cold Drinks',emoji: '💧', desc: 'Large bottle of chilled mineral water',                                 image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80', sizes: [{label:'Bottle', price:120}] },
    { name: 'Mineral Water Small',    category: 'Cold Drinks',emoji: '💧', desc: 'Small bottle of chilled mineral water',                                 image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80', sizes: [{label:'Bottle', price:69}] },
    { name: 'Soft Drink',             category: 'Cold Drinks',emoji: '🥤', desc: 'Chilled soft drink can',                                                image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Can', price:120}] },
    { name: 'Fresh Lime',             category: 'Cold Drinks',emoji: '🍋', desc: 'Fresh squeezed lime drink — sweet or salty',                           image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:189}] },
    { name: 'Cold Coffee',            category: 'Cold Drinks',emoji: '☕', desc: 'Chilled cold coffee with cream',                                        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80', sizes: [{label:'Glass', price:349}] },
    { name: 'Fresh Seasonal Fruit Juice',category:'Cold Drinks',emoji:'🍊',desc: 'Freshly squeezed seasonal fruit juice',                                 image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', sizes: [{label:'Glass', price:299}] },
    { name: 'Lassi Sweet / Saltish',  category: 'Cold Drinks',emoji: '🥛', desc: 'Chilled yogurt lassi — choose sweet or salty',                         image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', sizes: [{label:'Glass', price:199}] },

    // ── ICE CREAM ──
    { name: 'Vanilla Ice Cream',      category: 'Ice Cream',  emoji: '🍦', desc: 'Classic creamy vanilla ice cream',                                     image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },
    { name: 'Tutti Fruitti Ice Cream',category: 'Ice Cream',  emoji: '🍓', desc: 'Colourful tutti fruitti mix ice cream',                                 image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },
    { name: 'Chocolate Ice Cream',    category: 'Ice Cream',  emoji: '🍫', desc: 'Rich dark chocolate ice cream',                                        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },
    { name: 'Caramel Ice Cream',      category: 'Ice Cream',  emoji: '🍮', desc: 'Smooth buttery caramel ice cream',                                     image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },
    { name: 'Strawberry Ice Cream',   category: 'Ice Cream',  emoji: '🍓', desc: 'Fresh strawberry flavour ice cream',                                   image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },
    { name: 'Mango Ice Cream',        category: 'Ice Cream',  emoji: '🥭', desc: 'Tropical mango flavour ice cream',                                     image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },
    { name: 'Pista Ice Cream',        category: 'Ice Cream',  emoji: '🌿', desc: 'Premium pistachio ice cream',                                          image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },
    { name: 'Kulfa Ice Cream',        category: 'Ice Cream',  emoji: '🍦', desc: 'Traditional desi Kulfa ice cream',                                     image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },
    { name: 'Blue Berry Ice Cream',   category: 'Ice Cream',  emoji: '🫐', desc: 'Tangy sweet blueberry ice cream',                                      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },
    { name: 'Pineapple Ice Cream',    category: 'Ice Cream',  emoji: '🍍', desc: 'Tropical pineapple ice cream',                                         image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },
    { name: 'Orange Ice Cream',       category: 'Ice Cream',  emoji: '🍊', desc: 'Zesty orange flavour ice cream',                                       image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Single', price:120},{label:'Double', price:220}] },

    // ── DESSERTS ──
    { name: 'Kulfa Falooda',          category: 'Desserts',   emoji: '🍨', desc: 'Traditional rose Kulfa topped with Falooda vermicelli',                image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Portion', price:349}] },
    { name: 'O-Bailia Special Faloda',category: 'Desserts',   emoji: '👑', desc: 'House signature special Falooda — layered & indulgent',                image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Portion', price:399}] },
    { name: 'Khumali',                category: 'Desserts',   emoji: '🍮', desc: 'Traditional Pakistani Khumali dessert — sweet & creamy',               image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', sizes: [{label:'Portion', price:999}] },
    { name: 'Nutella Steam Pizza',    category: 'Desserts',   emoji: '🍕', desc: 'Warm steamed pizza drizzled with Nutella — dessert indulgence',        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', sizes: [{label:'Portion', price:999}] },
  ];
}

// ===== INIT =====
async function initAll() {
  menuItems = getDefaultMenu();

  // Load bookings from localStorage
  try {
    const saved = localStorage.getItem('ob_bookings');
    if (saved) bookings = JSON.parse(saved);
  } catch(e) { bookings = []; }

  // Load settings from localStorage
  try {
    const savedSettings = localStorage.getItem('ob_settings');
    if (savedSettings) {
      const s = JSON.parse(savedSettings);
      settings.waNumber = s.waNumber || '923357367364';
      settings.deliveryCharge = s.deliveryCharge != null ? s.deliveryCharge : 0;
    }
  } catch(e) {}

  initLoader();
  initCursor();
  initParticles();
  initNavbar();
  initMenu();
  initOrderSection();
  initReveal();
  initCounters();
  initBookingTableTypes();
  initBookingDateMin();
  renderCart();
  checkAdminSession();
}

document.addEventListener('DOMContentLoaded', initAll);

// ===== LOADER =====
function initLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('hidden'), 2500);
}

// ===== CUSTOM CURSOR =====
function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  document.addEventListener('mousemove', e => {
    dot.style.left  = e.clientX + 'px';
    dot.style.top   = e.clientY + 'px';
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mousedown', () => { dot.classList.add('clicked'); ring.classList.add('clicked'); });
  document.addEventListener('mouseup',   () => { dot.classList.remove('clicked'); ring.classList.remove('clicked'); });
}

// ===== PARTICLE CANVAS =====
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // O-Bailia uses amber/gold particles on deep dark background
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.6 + 0.1,
      // Alternate amber, gold, and deep red to match OB logo
      c: ['rgba(230,168,46,', 'rgba(198,140,20,', 'rgba(180,30,30,'][Math.floor(Math.random()*3)]
    });
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c + p.o + ')';
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    // Active nav link based on scroll position
    document.querySelectorAll('section[id]').forEach(section => {
      const top    = section.offsetTop - 120;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  });
}

function toggleMobileNav() {
  const links = document.querySelector('.nav-links');
  if (links) links.classList.toggle('open');
}

function closeMobileNav() {
  const links = document.querySelector('.nav-links');
  if (links) links.classList.remove('open');
}

// ===== SCROLL COUNTERS =====
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target);
        let current  = 0;
        const increment = target / 80;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { el.textContent = target; clearInterval(timer); }
          else el.textContent = Math.floor(current);
        }, 25);
        observer.unobserve(el);
      }
    });
  });
  counters.forEach(c => observer.observe(c));
}

// ===== MENU =====
function initMenu() {
  renderMenuGrid();
  document.querySelectorAll('#menuCategories .cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#menuCategories .cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMenuFilter = btn.dataset.cat;
      renderMenuGrid();
    });
  });
}

function getItemMinPrice(item) {
  if (item.sizes && item.sizes.length > 0) return item.sizes[0].price;
  return item.price || 0;
}

function addToCartWithSize(itemIdx, sizeIdx) {
  const item = menuItems[itemIdx];
  if (!item) return;
  const size = item.sizes ? item.sizes[sizeIdx] : { label: 'Regular', price: item.price };
  const key  = item.name + '_' + size.label;
  const existing = cart.find(c => c.key === key);
  if (existing) existing.qty++;
  else cart.push({ key, name: item.name, sizeLabel: size.label, price: size.price, qty: 1 });
  renderCart();
  showToast(`${item.emoji || '🍽️'} ${item.name} (${size.label}) added!`);
}

function renderMenuGrid() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  const filtered = currentMenuFilter === 'all'
    ? menuItems
    : menuItems.filter(i => i.category === currentMenuFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-muted)">No items in this category yet.</div>';
    return;
  }
  grid.innerHTML = filtered.map((item) => {
    const realIdx     = menuItems.indexOf(item);
    const minPrice    = getItemMinPrice(item);
    const hasMultiSizes = item.sizes && item.sizes.length > 1;
    return `
      <div class="menu-card reveal">
        <div class="menu-card-img">
          ${item.image
            ? `<img src="${item.image}" alt="${sanitize(item.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
               <div class="menu-card-emoji" style="display:none">${item.emoji||'🍽️'}</div>`
            : `<div class="menu-card-emoji">${item.emoji||'🍽️'}</div>`}
          <div class="menu-card-badge">${item.category}</div>
        </div>
        <div class="menu-card-body">
          <div class="menu-card-name">${sanitize(item.name)}</div>
          <div class="menu-card-desc">${sanitize(item.desc) || 'Freshly prepared with finest ingredients'}</div>
          ${hasMultiSizes ? `
          <div class="menu-size-grid">
            ${item.sizes.map((s,si) => `
              <button class="size-btn" onclick="addToCartWithSize(${realIdx},${si})">
                <span class="size-label">${s.label}</span>
                <span class="size-price">Rs. ${s.price}</span>
              </button>`).join('')}
          </div>` : `
          <div class="menu-card-footer">
            <div class="menu-card-price">Rs. ${minPrice}</div>
            <button class="menu-card-add" onclick="addToCartWithSize(${realIdx},0)">+</button>
          </div>`}
        </div>
      </div>`;
  }).join('');
  initRevealElements();
}

// ===== ITEM MODAL (menu card click to view) =====
function openItemModal(idx) {
  const item = menuItems[idx];
  if (!item) return;
  const modal = document.getElementById('itemModal');
  if (!modal) return;
  const minPrice = getItemMinPrice(item);
  const hasMulti = item.sizes && item.sizes.length > 1;

  document.getElementById('modalItemName').textContent  = item.name;
  document.getElementById('modalItemDesc').textContent  = item.desc || 'Freshly prepared with finest ingredients';
  document.getElementById('modalItemBadge').textContent = item.category;
  const imgEl = document.getElementById('modalItemImg');
  if (imgEl) {
    imgEl.src = item.image || '';
    imgEl.onerror = () => { imgEl.style.display = 'none'; };
    imgEl.style.display = item.image ? '' : 'none';
  }

  const sizesEl = document.getElementById('modalItemSizes');
  if (sizesEl) {
    if (hasMulti) {
      sizesEl.innerHTML = `<div class="menu-size-grid">
        ${item.sizes.map((s,si) => `
          <button class="size-btn" onclick="addToCartWithSize(${idx},${si});closeItemModal()">
            <span class="size-label">${s.label}</span>
            <span class="size-price">Rs. ${s.price}</span>
          </button>`).join('')}
      </div>`;
    } else {
      sizesEl.innerHTML = `
        <div class="modal-single-price">Rs. ${minPrice}</div>
        <button class="btn-primary" onclick="addToCartWithSize(${idx},0);closeItemModal()">
          <span>Add to Cart</span>
        </button>`;
    }
  }
  modal.style.display = 'flex';
}

function closeItemModal() {
  const modal = document.getElementById('itemModal');
  if (modal) modal.style.display = 'none';
}

// ===== ORDER SECTION =====
function initOrderSection() {
  renderOrderCategories();
  renderOrderItems();
  const searchEl = document.getElementById('orderSearch');
  if (searchEl) {
    searchEl.addEventListener('input', e => renderOrderItems(e.target.value.toLowerCase()));
  }
}

function renderOrderCategories() {
  const cats = ['all', ...new Set(menuItems.map(i => i.category))];
  const container = document.getElementById('orderCats');
  if (!container) return;
  container.innerHTML = cats.map(cat => `
    <button class="cat-btn ${cat === currentOrderFilter ? 'active' : ''}"
            onclick="filterOrderItems('${cat.replace(/'/g,"\\'")}')">
      ${cat === 'all' ? 'All' : cat}
    </button>`).join('');
}

function filterOrderItems(cat) {
  currentOrderFilter = cat;
  document.querySelectorAll('#orderCats .cat-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#orderCats .cat-btn').forEach(b => {
    if (b.textContent.trim() === (cat === 'all' ? 'All' : cat)) b.classList.add('active');
  });
  renderOrderItems();
}

function renderOrderItems(search = '') {
  const grid = document.getElementById('orderItemsGrid');
  if (!grid) return;
  let filtered = currentOrderFilter === 'all'
    ? menuItems
    : menuItems.filter(i => i.category === currentOrderFilter);
  if (search) filtered = filtered.filter(i => i.name.toLowerCase().includes(search));

  grid.innerHTML = filtered.map((item) => {
    const realIdx = menuItems.indexOf(item);
    const minPrice = getItemMinPrice(item);
    const hasMulti = item.sizes && item.sizes.length > 1;
    return `
      <div class="order-item-card">
        ${item.image
          ? `<img class="order-item-img" src="${item.image}" alt="${sanitize(item.name)}"
               loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"/>`
          : ''}
        <div class="order-item-emoji" style="${item.image ? 'display:none' : ''}">${item.emoji||'🍽️'}</div>
        <div class="order-item-info">
          <div class="order-item-name" title="${sanitize(item.name)}">${sanitize(item.name)}</div>
          ${hasMulti
            ? `<div class="order-size-pills">${item.sizes.map((s,si) => `
                <button class="order-size-pill" onclick="addToCartWithSize(${realIdx},${si})">${s.label} Rs.${s.price}</button>`).join('')}
               </div>`
            : `<div class="order-item-price">Rs. ${minPrice}</div>`}
        </div>
        ${!hasMulti ? `<button class="order-item-add" onclick="addToCartWithSize(${realIdx},0)">+</button>` : ''}
      </div>`;
  }).join('');
}

// ===== CART =====
function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotals = document.getElementById('cartTotals');
  const cartCount  = document.getElementById('cartCount');
  const placeBtn   = document.getElementById('placeOrderBtn');
  if (!cartItems) return;

  cartCount.textContent = cart.reduce((a, c) => a + c.qty, 0);

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><div>Add items from the menu</div></div>';
    if (cartTotals) cartTotals.style.display = 'none';
    if (placeBtn) placeBtn.disabled = true;
    return;
  }

  cartItems.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-name">
        ${sanitize(item.name)}
        ${item.sizeLabel && !['Regular','Single','Portion','Bottle','Each','Cup','Glass','Full'].includes(item.sizeLabel)
          ? `<br><small style="color:var(--amber);font-size:0.75rem">${item.sizeLabel}</small>` : ''}
      </div>
      <div class="cart-item-qty">
        <button onclick="changeCartQty(${idx}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeCartQty(${idx}, 1)">+</button>
      </div>
      <div class="cart-item-price">Rs. ${item.price * item.qty}</div>
    </div>`).join('');

  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const delivery = +settings.deliveryCharge || 0;
  const total    = subtotal + delivery;

  const subEl = document.getElementById('cartSubtotal');
  const delEl = document.getElementById('cartDelivery');
  const totEl = document.getElementById('cartTotal');
  if (subEl) subEl.textContent = `Rs. ${subtotal}`;
  if (delEl) delEl.textContent = delivery > 0 ? `Rs. ${delivery}` : 'Free';
  if (totEl) totEl.textContent = `Rs. ${total}`;
  if (cartTotals) cartTotals.style.display = 'block';
  if (placeBtn) placeBtn.disabled = false;
}

function changeCartQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
}

function placeOrder() {
  const name    = document.getElementById('delName')?.value.trim();
  const phone   = document.getElementById('delPhone')?.value.trim();
  const address = document.getElementById('delAddress')?.value.trim();
  const notes   = document.getElementById('delNotes')?.value.trim();
  const payment = document.querySelector('input[name="payment"]:checked')?.value || 'Cash on Delivery';

  if (!name || !phone || !address) { showToast('⚠️ Please fill in all required fields'); return; }
  if (cart.length === 0) { showToast('⚠️ Your cart is empty'); return; }

  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const delivery = +settings.deliveryCharge || 0;
  const total    = subtotal + delivery;

  let orderText = `🍽️ *O-BAILIA RESTAURANT — NEW ORDER*\n`;
  orderText += `House of Taste | Sanghar\n\n`;
  orderText += `*Customer:* ${name}\n*Phone:* ${phone}\n*Address:* ${address}\n\n`;
  orderText += `*Order Details:*\n`;
  cart.forEach(item => {
    const sizeTxt = item.sizeLabel && item.sizeLabel !== 'Regular' ? ` (${item.sizeLabel})` : '';
    orderText += `• ${item.name}${sizeTxt} x${item.qty} = Rs. ${item.price * item.qty}\n`;
  });
  orderText += `\n*Subtotal:* Rs. ${subtotal}\n`;
  orderText += delivery > 0 ? `*Delivery:* Rs. ${delivery}\n` : '';
  orderText += `*Total: Rs. ${total}*\n`;
  orderText += `*Payment:* ${payment}\n`;
  if (notes) orderText += `*Notes:* ${notes}`;

  const wa = settings.waNumber || '923357367364';
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(orderText)}`, '_blank');

  cart = [];
  renderCart();
  ['delName','delPhone','delAddress','delNotes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  showToast('✅ Order sent via WhatsApp!');
}

// ===== BOOKING =====
function initBookingTableTypes() {
  document.querySelectorAll('.table-type-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.table-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedTableType = card.dataset.type;
      const typeInput = document.getElementById('bookTableType');
      if (typeInput) typeInput.value = selectedTableType;
    });
  });
}

function initBookingDateMin() {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('bookDate');
  if (dateInput) dateInput.min = today;
}

function submitBooking() {
  const name      = document.getElementById('bookName')?.value.trim();
  const phone     = document.getElementById('bookPhone')?.value.trim();
  const date      = document.getElementById('bookDate')?.value;
  const time      = document.getElementById('bookTime')?.value;
  const guests    = document.getElementById('bookGuests')?.value;
  const tableType = document.getElementById('bookTableType')?.value || selectedTableType || 'Standard';
  const notes     = document.getElementById('bookNotes')?.value.trim();

  if (!name || !phone || !date || !time || !guests) {
    showToast('⚠️ Please fill all required fields');
    return;
  }

  const booking = { id: Date.now(), name, phone, date, time, guests, tableType, notes };
  bookings.unshift(booking);

  // Persist bookings in localStorage
  try { localStorage.setItem('ob_bookings', JSON.stringify(bookings)); } catch(e) {}

  let msg = `🍽️ *O-BAILIA RESTAURANT — TABLE RESERVATION*\n`;
  msg += `House of Taste | Sanghar\n\n`;
  msg += `*Name:* ${name}\n*Phone:* ${phone}\n`;
  msg += `*Date:* ${date}\n*Time:* ${time}\n`;
  msg += `*Guests:* ${guests}\n*Table Type:* ${tableType}\n`;
  if (notes) msg += `*Special Requests:* ${notes}`;

  const wa = settings.waNumber || '923357367364';
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank');

  ['bookName','bookPhone','bookDate','bookTime','bookGuests','bookNotes','bookTableType'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('.table-type-card').forEach(c => c.classList.remove('selected'));
  selectedTableType = '';

  if (adminLoggedIn) {
    renderAdminBookingsTable();
    updateAdminStats();
  }
  showToast('✅ Reservation sent! We\'ll confirm shortly.');
}

// ===== ADMIN — Local Auth (No Firebase) =====
function checkAdminSession() {
  try {
    const session = sessionStorage.getItem('ob_admin');
    if (session === 'true') {
      adminLoggedIn = true;
      showAdminDashboard();
    }
  } catch(e) {}
}

function adminLogin() {
  const user = document.getElementById('adminUser')?.value.trim();
  const pass = document.getElementById('adminPass')?.value.trim();
  const err  = document.getElementById('loginError');

  if (!user || !pass) {
    if (err) { err.style.display = 'block'; err.textContent = '⚠️ Username aur password daalen'; }
    return;
  }

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    adminLoggedIn = true;
    try { sessionStorage.setItem('ob_admin', 'true'); } catch(e) {}
    if (err) err.style.display = 'none';
    showAdminDashboard();
  } else {
    if (err) { err.style.display = 'block'; err.textContent = '❌ Username ya password galat hai'; }
    if (document.getElementById('adminPass')) document.getElementById('adminPass').value = '';
  }
}

function showAdminDashboard() {
  const loginEl = document.getElementById('adminLogin');
  const dashEl  = document.getElementById('adminDashboard');
  if (loginEl) loginEl.style.display = 'none';
  if (dashEl)  dashEl.style.display  = 'block';
  renderAdminMenuTable();
  renderAdminBookingsTable();
  updateAdminStats();
}

function adminLogout() {
  adminLoggedIn = false;
  try { sessionStorage.removeItem('ob_admin'); } catch(e) {}
  const loginEl = document.getElementById('adminLogin');
  const dashEl  = document.getElementById('adminDashboard');
  if (loginEl) loginEl.style.display = 'flex';
  if (dashEl)  dashEl.style.display  = 'none';
  if (document.getElementById('adminUser')) document.getElementById('adminUser').value = '';
  if (document.getElementById('adminPass')) document.getElementById('adminPass').value = '';
}

// Admin tabs
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.style.display = 'block';
    });
  });
});

function renderAdminMenuTable() {
  const tbody = document.getElementById('adminMenuBody');
  if (!tbody) return;
  if (menuItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted)">No menu items yet.</td></tr>';
    return;
  }
  tbody.innerHTML = menuItems.map((item, idx) => {
    const displayPrice = item.sizes && item.sizes.length > 0
      ? (item.sizes.length === 1
          ? `Rs. ${item.sizes[0].price}`
          : `Rs. ${item.sizes[0].price} – ${item.sizes[item.sizes.length-1].price}`)
      : `Rs. ${item.price || 0}`;
    return `
      <tr>
        <td>${item.image
              ? `<img class="admin-table-img" src="${item.image}" alt="${sanitize(item.name)}"/>`
              : `<span class="admin-table-emoji">${item.emoji || '🍽️'}</span>`}
        </td>
        <td><strong>${sanitize(item.name)}</strong><br>
            <small style="color:var(--text-muted)">${sanitize(item.desc)}</small></td>
        <td>${item.category}</td>
        <td style="color:var(--amber);font-weight:700">${displayPrice}</td>
        <td>
          <div class="admin-action-btns">
            <button class="admin-edit-btn" onclick="editItem(${idx})">✏️ Edit</button>
            <button class="admin-del-btn"  onclick="deleteItem(${idx})">🗑️ Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function renderAdminBookingsTable() {
  const tbody = document.getElementById('adminBookingsBody');
  if (!tbody) return;
  if (bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-muted)">No reservations yet.</td></tr>';
    return;
  }
  tbody.innerHTML = bookings.map((b, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${sanitize(b.name)}</strong></td>
      <td>${sanitize(b.phone)}</td>
      <td>${sanitize(b.date)}</td>
      <td>${sanitize(b.time)}</td>
      <td>${sanitize(String(b.guests))}</td>
      <td><span style="color:var(--amber)">${sanitize(b.tableType || 'Standard')}</span></td>
      <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis">${sanitize(b.notes || '—')}</td>
    </tr>`).join('');
}

function updateAdminStats() {
  const statItems    = document.getElementById('statItems');
  const statCats     = document.getElementById('statCats');
  const statBookings = document.getElementById('statBookings');
  if (statItems)    statItems.textContent    = menuItems.length;
  if (statCats)     statCats.textContent     = new Set(menuItems.map(i => i.category)).size;
  if (statBookings) statBookings.textContent = bookings.length;
}

function clearBookings() {
  if (confirm('Clear all reservations? This cannot be undone.')) {
    bookings = [];
    try { localStorage.removeItem('ob_bookings'); } catch(e) {}
    renderAdminBookingsTable();
    updateAdminStats();
    showToast('🗑️ All reservations cleared');
  }
}

// ===== ADMIN ITEM MODAL =====
function togglePriceFields() {
  const type = document.getElementById('itemPriceType')?.value;
  const single   = document.getElementById('priceSingle');
  const halfFull = document.getElementById('priceHalfFull');
  const sml      = document.getElementById('priceSML');
  if (single)   single.style.display   = (type === 'single')   ? '' : 'none';
  if (halfFull) halfFull.style.display = (type === 'halfFull') ? '' : 'none';
  if (sml)      sml.style.display      = (type === 'sml')      ? '' : 'none';
}

function showAddItemModal() {
  const fields = ['itemName','itemCategory','itemEmoji','itemDesc','itemImageData',
                  'itemPrice','itemPriceHalf','itemPriceFull','itemPriceS','itemPriceM','itemPriceL'];
  fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const titleEl = document.getElementById('modalTitle');
  if (titleEl) titleEl.textContent = 'Add Menu Item';
  const editIdxEl = document.getElementById('editItemIndex');
  if (editIdxEl) editIdxEl.value = '-1';
  const typeEl = document.getElementById('itemPriceType');
  if (typeEl) typeEl.value = 'single';
  togglePriceFields();
  resetImagePreview();
  const modal = document.getElementById('itemModal');
  if (modal) modal.style.display = 'flex';
}

function editItem(idx) {
  const item = menuItems[idx];
  if (!item) return;
  ['itemName','itemCategory','itemEmoji','itemDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = item[id.replace('item','').toLowerCase()] || item.name || '';
  });
  const fields = { itemName: item.name, itemCategory: item.category, itemEmoji: item.emoji||'', itemDesc: item.desc||'' };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
  const titleEl = document.getElementById('modalTitle');
  if (titleEl) titleEl.textContent = 'Edit Menu Item';
  const editIdxEl = document.getElementById('editItemIndex');
  if (editIdxEl) editIdxEl.value = idx;
  const imgDataEl = document.getElementById('itemImageData');
  if (imgDataEl) imgDataEl.value = item.image || '';

  // Clear price fields
  ['itemPrice','itemPriceHalf','itemPriceFull','itemPriceS','itemPriceM','itemPriceL'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });

  // Detect price type
  const sizes  = item.sizes || [];
  const labels = sizes.map(s => s.label.toLowerCase());
  const typeEl = document.getElementById('itemPriceType');
  if (typeEl) {
    if (sizes.length === 1 && !labels.includes('half') && !labels.includes('full') && !labels.includes('small')) {
      typeEl.value = 'single';
      const el = document.getElementById('itemPrice'); if (el) el.value = sizes[0].price;
    } else if (labels.includes('half') || labels.includes('full')) {
      typeEl.value = 'halfFull';
      sizes.forEach(s => {
        if (s.label.toLowerCase() === 'half') { const el = document.getElementById('itemPriceHalf'); if (el) el.value = s.price; }
        if (s.label.toLowerCase() === 'full') { const el = document.getElementById('itemPriceFull'); if (el) el.value = s.price; }
      });
    } else if (labels.includes('small') || labels.includes('medium') || labels.includes('large')) {
      typeEl.value = 'sml';
      sizes.forEach(s => {
        if (s.label.toLowerCase() === 'small')  { const el = document.getElementById('itemPriceS'); if (el) el.value = s.price; }
        if (s.label.toLowerCase() === 'medium') { const el = document.getElementById('itemPriceM'); if (el) el.value = s.price; }
        if (s.label.toLowerCase() === 'large')  { const el = document.getElementById('itemPriceL'); if (el) el.value = s.price; }
      });
    } else {
      typeEl.value = 'single';
      const el = document.getElementById('itemPrice'); if (el) el.value = sizes[0]?.price || item.price || '';
    }
  }
  togglePriceFields();

  if (item.image) {
    const preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = `
      <img src="${item.image}" alt="preview" style="width:100%;height:180px;object-fit:cover"/>
      <div class="preview-change" onclick="document.getElementById('itemImageFile').click()">Click to change</div>`;
  } else {
    resetImagePreview();
  }
  const modal = document.getElementById('itemModal');
  if (modal) modal.style.display = 'flex';
}

function closeAdminItemModal() {
  const modal = document.getElementById('itemModal');
  if (modal) modal.style.display = 'none';
}

function saveItem() {
  const name      = document.getElementById('itemName')?.value.trim();
  const category  = document.getElementById('itemCategory')?.value;
  const emoji     = document.getElementById('itemEmoji')?.value.trim() || '🍽️';
  const desc      = document.getElementById('itemDesc')?.value.trim();
  const image     = document.getElementById('itemImageData')?.value;
  const editIdx   = parseInt(document.getElementById('editItemIndex')?.value);
  const priceType = document.getElementById('itemPriceType')?.value;

  if (!name || !category) { showToast('⚠️ Name aur Category zaroori hain'); return; }

  let sizes = [];
  if (priceType === 'single') {
    const p = parseFloat(document.getElementById('itemPrice')?.value);
    if (!p) { showToast('⚠️ Price daalna zaroori hai'); return; }
    sizes = [{ label: 'Regular', price: p }];
  } else if (priceType === 'halfFull') {
    const half = parseFloat(document.getElementById('itemPriceHalf')?.value);
    const full = parseFloat(document.getElementById('itemPriceFull')?.value);
    if (!half || !full) { showToast('⚠️ Half aur Full dono prices daalne zaroori hain'); return; }
    sizes = [{ label: 'Half', price: half }, { label: 'Full', price: full }];
  } else if (priceType === 'sml') {
    const s = parseFloat(document.getElementById('itemPriceS')?.value);
    const m = parseFloat(document.getElementById('itemPriceM')?.value);
    const l = parseFloat(document.getElementById('itemPriceL')?.value);
    if (!s || !m || !l) { showToast('⚠️ Small, Medium aur Large teeno prices daalne zaroori hain'); return; }
    sizes = [{ label: 'Small', price: s }, { label: 'Medium', price: m }, { label: 'Large', price: l }];
  }

  const item = { name, category, emoji, desc, image, sizes };

  if (editIdx === -1) {
    menuItems.push(item);
  } else {
    menuItems[editIdx] = item;
  }

  closeAdminItemModal();
  renderAdminMenuTable();
  renderMenuGrid();
  renderOrderItems();
  renderOrderCategories();
  updateAdminStats();
  showToast(`✅ "${name}" ${editIdx === -1 ? 'add' : 'update'} ho gaya`);
}

function deleteItem(idx) {
  const name = menuItems[idx].name;
  if (confirm(`Delete "${name}"?`)) {
    menuItems.splice(idx, 1);
    renderAdminMenuTable();
    renderMenuGrid();
    renderOrderItems();
    renderOrderCategories();
    updateAdminStats();
    showToast(`🗑️ "${name}" deleted`);
  }
}

function previewImage(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const data = e.target.result;
    const dataEl = document.getElementById('itemImageData');
    if (dataEl) dataEl.value = data;
    const preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = `
      <img src="${data}" alt="preview" style="width:100%;height:180px;object-fit:cover"/>
      <div class="preview-change" onclick="document.getElementById('itemImageFile').click()">Click to change</div>`;
  };
  reader.readAsDataURL(input.files[0]);
}

function resetImagePreview() {
  const preview = document.getElementById('imagePreview');
  if (preview) preview.innerHTML = `
    <div class="image-preview-placeholder" onclick="document.getElementById('itemImageFile').click()">
      <div style="font-size:2rem">📸</div>
      <div>Click to Upload Image</div>
      <div style="font-size:0.75rem;opacity:0.6">JPG, PNG, WebP supported</div>
    </div>`;
  const fileEl = document.getElementById('itemImageFile');
  if (fileEl) fileEl.value = '';
}

// ===== SETTINGS =====
function changePassword() {
  const newP  = document.getElementById('newPass')?.value;
  const confP = document.getElementById('confirmPass')?.value;
  const msg   = document.getElementById('passMsg');

  if (!newP) { if (msg) { msg.style.color = '#ff6b6b'; msg.textContent = '❌ Naya password daalen'; } return; }
  if (newP.length < 6) { if (msg) { msg.style.color = '#ff6b6b'; msg.textContent = '❌ Password kam az kam 6 characters ka hona chahiye'; } return; }
  if (newP !== confP) { if (msg) { msg.style.color = '#ff6b6b'; msg.textContent = '❌ Passwords match nahi kar rahe'; } return; }

  // In this local-auth version, we show a note
  if (msg) { msg.style.color = '#4CAF50'; msg.textContent = '✅ (Password change ke liye HTML file mein ADMIN_PASS update karen)'; }
  if (document.getElementById('newPass')) document.getElementById('newPass').value = '';
  if (document.getElementById('confirmPass')) document.getElementById('confirmPass').value = '';
}

function saveSettings() {
  const waEl  = document.getElementById('settingWa');
  const dcEl  = document.getElementById('settingDelivery');
  settings.waNumber       = waEl  ? waEl.value.trim()  : settings.waNumber;
  settings.deliveryCharge = dcEl  ? +dcEl.value || 0   : settings.deliveryCharge;
  try { localStorage.setItem('ob_settings', JSON.stringify(settings)); } catch(e) {}
  if (cart.length > 0) renderCart();
  showToast('✅ Settings saved successfully');
}

// ===== AI ASSISTANT =====
function toggleAssistant() {
  const panel = document.getElementById('assistantPanel');
  if (panel) panel.classList.toggle('open');
}

function quickMsg(text) {
  const input = document.getElementById('assistantInput');
  if (input) { input.value = text; sendAssistantMsg(); }
}

async function sendAssistantMsg() {
  const input = document.getElementById('assistantInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  appendAssistantMsg(msg, 'user');
  conversationHistory.push({ role: 'user', content: msg });
  if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

  const typingId = appendTyping();

  try {
    const systemPrompt = `You are the friendly AI assistant for O-Bailia Restaurant — "House of Taste" — a premium restaurant in Sanghar, Sindh, Pakistan.

Restaurant Info:
- Name: O-Bailia Restaurant
- Tagline: House of Taste
- Location: Kot Sultan Nawabshah Road, Sanghar, Sindh, Pakistan
- Phone: 0335-7367364, 0325-7367364
- Restaurant Manager: 0334-7367367
- Take Away & Home Delivery available
- Google Maps: https://maps.app.goo.gl/NhaFR55p2ieUN4vU7

Menu Categories: BBQ, Karahi, Handi, Biryani, Mandi, Pizza, Burgers, Pasta, Chinese, Rolls, Paneer, Beverages, Desserts, Ice Cream, Milkshakes, Mocktails, Salads, Soups, Fried Items, Fries, Sandwiches, Rice, Steaks, Tandoor (Roti/Naan), Vegetable, Extras

Popular Items:
- BBQ Platter Full: Rs. 4199, Half: Rs. 2499, Mini: Rs. 1799
- Chicken Karahi: Half Rs. 1199 / Full Rs. 2299
- Mutton Karahi: Half Rs. 1999 / Full Rs. 3699
- Chicken Handi: Half Rs. 1199 / Full Rs. 2199
- Chicken Dum Biryani: Half Rs. 1049 / Full Rs. 1799
- Malai Boti: Half Rs. 599 / Full Rs. 899
- Chicken Burger: Rs. 399, King Crunch Burger: Rs. 699
- Mutton Mandi With Rice: Rs. 3999
- Chicken Mandi: Rs. 1999
- Paneer Karahi: Half Rs. 1599 / Full Rs. 2999

Table Booking: Ask for name, phone, date, time, guests, table type, and special requests. Then tell them to use the Reserve section on the website or call.

Respond in the same language the user uses (Urdu or English). Be warm, helpful and professional. Keep responses concise.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': window.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: conversationHistory
      })
    });

    removeTyping(typingId);

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const replyText = data.content?.[0]?.text
      || 'Mujhe maafi chahiye, abhi jawab nahi de sakta. Barahkarram hamein call karein: 0335-7367364.';

    appendAssistantMsg(replyText, 'bot');
    conversationHistory.push({ role: 'assistant', content: replyText });

  } catch (err) {
    removeTyping(typingId);
    const fallback = getFallbackResponse(msg.toLowerCase());
    appendAssistantMsg(fallback, 'bot');
    conversationHistory.push({ role: 'assistant', content: fallback });
  }
}

function getFallbackResponse(msg) {
  if (msg.includes('book') || msg.includes('table') || msg.includes('reserve') || msg.includes('booking') || msg.includes('reservation')) {
    return `🪑 <strong>Table Reservation</strong><br><br>Table book karne ke liye:<br>1. <a href="#booking" style="color:var(--amber)">Reserve section</a> use karein<br>2. Ya call karein: <strong>0335-7367364</strong><br>3. Ya Manager: <strong>0334-7367367</strong><br><br>Aapka swagat hai O-Bailia mein! 🍽️`;
  }
  if (msg.includes('time') || msg.includes('hour') || msg.includes('open') || msg.includes('timing') || msg.includes('waqt')) {
    return `🕐 <strong>Opening Hours</strong><br><br>Hum rooz khule hain aapki seva ke liye!<br><br>Call kare
