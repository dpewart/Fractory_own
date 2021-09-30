Researches = {};

Research = Ice.$extend('Research', {
    __init__: function(opts) {
        var self = this;
        self.$super();

        self.code = opts.code || self.$class.$name;
        self.name = ko.observable(opts.name);
        self.mana_cost = ko.observable(opts.mana_cost || 0);
        self.arcana_requirement = ko.observable(opts.arcana_requirement || 0);
        self.prerequisites = ko.observableArray(opts.prerequisites || []);
        self.description = ko.observable(opts.description || "");

        Researches[self.code] = self;
    },
    available: function(game) {
        var self = this;
        if(game.learned_research()[self.code]) return false;
        return _.all(self.prerequisites(), function(preq) {
            return game.learned_research()[preq];
        });
    },
    can_buy: function(game) {
        var self = this
        if(!self.available(game)) return false;
        if(game.arcana() < self.arcana_requirement()) return false;
        if(game.mana() < self.mana_cost()) return false;

        return true;
    },
    apply: function(game) {
        return;
    },
    css: function(game) {
        var self = this;
        if(game.learned_research()[self.code]) return 'learned';
        if(!self.available(game)) return 'unavailable';
        if(!self.can_buy(game)) return 'cannot_buy';
        return 'can_buy';
    }
});

UnlockMech = Research.$extend('UnlockMech', {
    __init__: function(opts) {
        var self = this;
        self.$super(opts);
        self.mech_code = ko.observable(opts.mech_code);
    },
    apply: function(game) {
        var self = this;
        if(!game.unlocked_stats()[self.mech_code()]) {
            game.unlocked_stats_list.push(self.mech_code());
        }
    }

    /*    self.name('Radiance');
        self.mana_cost(100);
        self.arcana_requirement(0);
        self.description('Unlock Radiance.  Increases mana generation on the part by a percentage.  Requires Generation to be on the part.')
    },*/
});

UnlockShop = Research.$extend('UnlockShop', {
    __init__: function(opts) {
        var self = this;
        self.$super(opts);
        self.shop_mode = ko.observable(opts.shop_mode);
    },
    apply: function(game) {
        var self = this;

        var iss = _.indexBy(game.shop_slots(), function(ss) {
            return ss.mode();
        });
        var ss = iss[self.shop_mode()];
        if(!ss) {
            ss = ShopSlot();
            ss.mode(self.shop_mode());
            ss.restock();
            game.shop_slots.push(ss);

        } else {
            ss.max_tier.inc(1);
        }
    }
});

UnlockBoost = Research.$extend('UnlockBoost', {
    __init__: function(opts) {
        var self = this;
        self.$super(opts);
        self.boost_code = ko.observable(opts.boost_code);
        self.boost_factor = ko.observable(opts.boost_factor || 1);
    },
    apply: function(game) {
        var self = this;

        game.add_boost(self.boost_code(), self.boost_factor());
    }
});



UnlockMech({
    code: 'LearnRadiance',
    mech_code: 'Radiance',
    name: 'Radiance',
    mana_cost: 100,
    arcana_requirement: 0,
    description: 'Unlock Radiance.  Increases mana generation on the part by a percentage.  Requires Generation to be on the part.'
})


UnlockMech({
    code: 'LearnBrilliance',
    name: 'Brilliance',
    mech_code: 'Brilliance',
    mana_cost: 500,
    arcana_requirement: 0,
    prerequisites: ['LearnRadiance'],
    description: "Unlock Brilliance.  Passes a percentage of other stats, as a buff, to downstream parts.",
})

UnlockMech({
    code: 'LearnArcana',
    name: 'Arcana',
    mech_code: 'Arcana',
    mana_cost: 1000,
    arcana_requirement: 0,
    prerequisites: ['LearnRadiance'],
    description: "Unlock Arcana.  Increases your magical aptitude so long as it is linked, unlocking more advanced research.",
})

UnlockMech({
    code: 'LearnMystery',
    name: 'Mystery',
    mech_code: 'Mystery',
    mana_cost: 10000,
    arcana_requirement: 0,
    prerequisites: ['LearnArcana'],
    description: "Unlock Mystery.  Increases arcana generated by a percentage.   Requires Arcana on the piece to be effective.",
})
UnlockMech({
    code: 'LearnRefining',
    name: 'Refining',
    mech_code: 'Refining',
    mana_cost: 10000,
    arcana_requirement: 20,
    prerequisites: ['LearnArcana', 'LearnBrilliance'],
    description: "Unlock Refining.  Permanently increases the highest stat on downstream parts.",
})
UnlockMech({
    code: 'LearnTwinkling',
    name: 'Twinkling',
    mech_code: 'Twinkling',
    mana_cost: 10000,
    arcana_requirement: 20,
    prerequisites: ['LearnArcana', 'LearnBrilliance'],
    description: "Unlock Twinkling.  Permanently transfers the lowest stat on upstream parts to downstream parts.",
})
// UnlockMech({
//     code: 'LearnGlow',
//     name: 'Glow',
//     mech_code: 'Glow',
//     mana_cost: 20000,
//     arcana_requirement: 20000,
//     prerequisites: ['LearnRadiance'],
//     description: "Unlock Arcana.  Increases your magical aptitude so long as it is linked, unlocking more advanced research.",
// })

UnlockShop({
    code: 'Fractals.1',
    name: 'Fractals I',
    mana_cost: 10000,
    arcana_requirement: 3000,
    shop_mode: 'fractal',
    prerequisites: ['LearnArcana', 'LearnBrilliance'],
    description: "Unlock tier 1 fractal crystals in the shop, giving you more space for crystals.",
})

var k = 1000;
var kk = 1000 * 1000;
var kkk = 1000 * 1000 * 1000;
function zeros(num, zeroes) {
    return num * Math.pow(10, zeroes||0);
}

UnlockBoost({
    code: 'BoostGeneration.1',
    name: 'Improved Generation I',
    mana_cost: 1, //50*k,
    arcana_requirement: 10*k,
    prerequisites: ['Fractals.1'],
    boost_code: 'Generation',
    boost_factor: 2,
    description: 'Increases the effectiveness of all Generation by 100%.'
});

var prev = Researches['BoostGeneration.1'];
for(var x = 2; x < 30; x++) {
    var made = UnlockBoost({
        code: 'BoostGeneration.' + x,
        name: 'Improved Generation ' + x.toRoman(),
        mana_cost: prev.mana_cost() * 10,
        arcana_requirement: prev.arcana_requirement() * 5,
        prerequisites: ['BoostGeneration.' + (x-1)],
        boost_code: 'Generation',
        boost_factor: 2,
        description: 'Increases the effectiveness of all Generation by 100%.'
    });
    prev = made;
}


// LearnMystery = Research.$extend('LearnMystery', {
//     __init__: function(opts) {
//         var self = this;
//         self.$super(code);

//         self.name('Mystery');
//         self.mana_cost(1000);
//         self.arcana_requirement(0);
//         self.prerequisites(['LearnArcana']);
//         self.description("Unlock Mystery.  Increases arcana generated by a percentage.   Requires Arcana on the piece to be effective.");
//     },
//     apply: function(game) {
//         var self = this;
//         if(!game.unlocked_stats()['Mystery']) {
//             game.unlocked_stats_list.push('Mystery');
//         }
//     }
// });

// LearnRefining = Research.$extend('LearnRefining', {
//     __init__: function(opts) {
//         var self = this;
//         self.$super(code);

//         self.name('Refining');
//         self.mana_cost(4000);
//         self.arcana_requirement(20);
//         self.prerequisites(['LearnArcana', 'LearnBrilliance']);
//         self.description("Unlock Refining.  Permanently increases the highest stat on downstream parts.");
//     },
//     apply: function(game) {
//         var self = this;
//         if(!game.unlocked_stats()['Refining']) {
//             game.unlocked_stats_list.push('Refining');
//         }
//     }
// });


// LearnTwinkling = Research.$extend('LearnTwinkling', {
//     __init__: function(opts) {
//         var self = this;
//         self.$super(code);

//         self.name('Twinkling');
//         self.mana_cost(4000);
//         self.arcana_requirement(20);
//         self.prerequisites(['LearnArcana', 'LearnBrilliance']);
//         self.description("Unlock Twinkling.  Permanently transfers the lowest stat on upstream parts to downstream parts.");
//     },
//     apply: function(game) {
//         var self = this;
//         if(!game.unlocked_stats()['Twinkling']) {
//             game.unlocked_stats_list.push('Twinkling');
//         }
//     }
// });

// Fractals1 = Research.$extend('Fractals1', {
//     __init__: function(opts) {
//         var self = this;
//         self.$super(code);

//         self.name('Fractals I');
//         self.mana_cost(10000);
//         self.arcana_requirement(10000);
//         self.prerequisites(['LearnArcana', 'LearnBrilliance']);
//         self.description("Unlock tier 1 fractal crystals in the shop, giving you more space for crystals.");
//     },
//     apply: function(game) {
//         var self = this;

//         var ss = ShopSlot();
//         ss.mode('fractal');
//         game.shop_slots.push(ss)
//         ss.restock();

//     }
// });


// LearnGlow = Research.$extend('LearnGlow', {
//     __init__: function(opts) {
//         var self = this;
//         self.$super(code);

//         self.name('Glow');
//         self.mana_cost(20000);
//         self.arcana_requirement();
//         self.prerequisites(['LearnRadiance', 'LearnMystery']);
//         self.description("Unlock Glow.  Increases mana and arcana generation by a percentage.  Requires Generation and/or Arcana on the crystal to be effective.");
//     },
//     apply: function(game) {
//         var self = this;
//         if(!game.unlocked_stats()['Glow']) {
//             game.unlocked_stats_list.push('Glow');
//         }
//     }
// });








// _.each(Research.$subclasses, function(kls) {
//     Researches[kls.$name] = kls();
// });
