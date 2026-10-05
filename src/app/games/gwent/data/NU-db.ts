import { createCard } from './card-creator';
import { GwentCard } from '../interfaces/gwent-card';

export const NU_CARD_DATABASE: GwentCard[] = [
  // id, name, type, power, provisions, artwork, faction, rarity, ability, tags, flavorText
  createCard('geralt', 'Geralt of Rivia', 'unit', 7, 10, 'Geralt_of_Rivia.jpg', 'NU', 'gold', undefined , 'Witcher', 'If that\'s what it takes to save the world, it\'s better to let that world die.'),
  createCard('ciri', 'Cirilla of Cintra', 'unit', 5, 10, 'Ciri.jpg', 'NU', 'gold', { type: 'deploy', keyword: 'destroy', target: 'manual', value: 9 }, 'Human', 'Know when fairy tales cease to be tales? When people start believing them.'),
  createCard('elder_bear', 'Elder Bear', 'unit', 9, 6, 'Elder_Bear.jpg', 'NU', 'silver', undefined , 'Beast', 'We\'re going on a bear hunt!'),
  /*createCard('roach', 'Roach', 'unit', 3, 8, 'Roach.jpg', 'NU', 'gold', 'When you play a gold unit, Summon self from your deck...', 'Beast', 'Geralt, we gotta have a man–to–horse talk.'),
  createCard('cow', 'Cow', 'unit', 6, 4, 'Cow.jpg', 'NU', 'bronze', 'No ability.', 'Beast', 'It\'s better to let that world die.'),
  createCard('dandelion', 'Dandelion', 'unit', 4, 9, 'Dandelion.jpg', 'NU', 'gold', 'Deploy: Draw a card, then play a card.', 'Human', 'The quill is mightier than the sword.'),
  createCard('scorch', 'Scorch', 'special', 0, 10, 'Scorch.jpg', 'NU', 'gold', 'Destroy all highest-power units.', 'Spell', 'Geralt took one step back.'),
  createCard('sandstorm', 'Sandstorm', 'special', 0, 7, 'Sandstorm.jpg', 'NU', 'gold', 'Destroy all lowest-power units.', 'Nature', 'Best case – sand in your teeth.'),
  createCard('triss', 'Triss Merigold', 'unit', 4, 8, 'Triss.jpg', 'NU', 'gold', 'Deploy: Shuffle a card, draw a unit, boost self by 2.', 'Human, Mage', 'Cap\'n… our arrows, they\'ve… they\'ve got wings!'),
  createCard('yennefer', 'Yennefer of Vengerberg', 'unit', 5, 10, 'Yennefer_of_Vengerberg.jpg', 'NU', 'gold', 'Deploy: Banish a unit, then damage enemy or boost self.', 'Human, Mage', 'Magic is Chaos, Art and Science.'),
  createCard('spores', 'Spores', 'special', 0, 4, 'Spores.jpg', 'NU', 'bronze', 'Reset the power of a unit.', 'Organic', 'Sowing madness and blight.'),
  createCard('golden_froth', 'Golden Froth', 'special', 0, 4, 'Golden_Froth.jpg', 'NU', 'bronze', 'Boost 3 adjacent units by 2.', 'Alchemy', 'The smell of happiness.'),
  createCard('mahakam_ale', 'Mahakam Ale', 'special', 0, 4, 'Mahakam_Ale.jpg', 'NU', 'bronze', 'Boost a unit by 5 and remove its Lock.', 'Alchemy', 'Dwarves\' greatest contribution.'),
  createCard('swallow', 'Swallow', 'special', 0, 4, 'Swallow.jpg', 'NU', 'bronze', 'Heal a unit, then boost it by 3.', 'Alchemy', 'Symbolizing spring and rejuvenation.'),
  createCard('wolf_pack', 'Wolf Pack', 'unit', 3, 5, 'Wolf_Pack.jpg', 'NU', 'bronze', 'Zeal. Order: Damage a unit by 2. Cooldown 2.', 'Beast', 'Relax, I know how to tame wolves…'),
  createCard('the_last_wish', 'The Last Wish', 'special', 0, 6, 'The_Last_Wish.jpg', 'NU', 'gold', 'Look at top 2, play one, banish the other.', 'Spell', 'A djinn fulfills but three wishes.'),
  createCard('aguara', 'Aguara', 'unit', 6, 6, 'Aguara.jpg', 'NU', 'silver', 'Deploy: Lock a unit or remove Lock.', 'Beast', 'Off to an aguara with you!'),
  createCard('oxernfurt_scholar', 'Oxenfurt Scholar', 'unit', 2, 4, 'Oxenfurt_Scholar.jpg', 'NU', 'bronze', 'At the end of your turn, boost self by 1.', 'Human', 'Balderdash!'),
  createCard('rock_barrage', 'Rock Barrage', 'special', 0, 6, 'Rock_Barrage.jpg', 'NU', 'silver', 'Damage a unit by 6, ignoring Armor.', 'Nature', 'Get hit by a boulder.'),
  createCard('samum', 'Samum', 'special', 0, 4, 'Samum.jpg', 'NU', 'bronze', 'Damage a unit by 4.', 'Bomb', 'Zerrikanian alchemists...'),
  createCard('scout', 'Scout', 'unit', 3, 5, 'Scout.jpg', 'NU', 'bronze', 'Deploy: Boost the next unit you play by 2.', 'Human, Soldier', 'If our scouts don\'t come back...')*/
];