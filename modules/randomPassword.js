var exports = module.exports = {};

var adverbs = ["slightly", "unnecessarily", "overly", "lightly", "very",
"quite", "a-bit", "weirdly", "agressively", "awkwardly", "manly",
"poorly", "awesomely", "nicely", "lovely", "brilliantly", "brutally",
"magically", "fairly", "actively", "anxiously", "deliberately", "gently"];

var adjectives = ["red", "blue", "green", "yellow", "pink", "brown",
"happy", "sad", "smiling", "exotic", "cheerful", "joyful", "liberal",
"conservative", "childish", "comfortable" ,"creative", "decent", "sound",
"cool", "smashing", "belter", "secret", "confident", "tall", "small",
"stupid", "idiotic", "organized", "scottish", "worrying"];

var nouns = ["man", "woman", "apple", "girl", "boy", "baby", "priest",
"teacher", "dog", "cat", "hippo", "chair", "square", "tissue", "water",
"drink", "pen", "mouse", "phone", "suitcase", "lorry", "monster", "knight",
"pizza", "burritto", "curry", "garage", "knickers", "stain", "cigarette"];

exports.getRandomPassword = function() {
  var a = Math.floor((Math.random() * (adverbs.length-1)));
  var b = Math.floor((Math.random() * (adjectives.length-1)));
  var c = Math.floor((Math.random() * (nouns.length-1)));
  return adverbs[a]+"-"+adjectives[b]+"-"+nouns[c];
}
