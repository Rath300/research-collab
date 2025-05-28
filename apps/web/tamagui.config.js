const { createInterFont } = require('@tamagui/font-inter')
const { shorthands } = require('@tamagui/shorthands')
const { themes, tokens } = require('@tamagui/themes')
const { createTamagui } = require('tamagui')

const interFont = createInterFont()

const config = createTamagui({
  defaultFont: 'body',
  animations: {
    fast: {
      type: 'spring',
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
    medium: {
      type: 'spring',
      damping: 10,
      mass: 0.9,
      stiffness: 100,
    },
    slow: {
      type: 'spring',
      damping: 20,
      stiffness: 60,
    },
  },
  fonts: {
    body: interFont,
    heading: interFont,
  },
  shorthands,
  tokens,
  themes,
})

module.exports = config 