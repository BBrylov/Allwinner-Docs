import type { NavbarConfig } from '@vuepress/theme-default'
import { version } from '../meta.js'

export const navbarRu: NavbarConfig = [
  {
    text: 'Основы встраиваемых систем',
    link: '/ru/'
  },
  {
    text: 'Работа с платами',
    link: '/ru/Board/'
  },
  {
    text: 'Разработка приложений',
    link: '/ru/Application/'
  },
  {
    text: 'Разработка системы',
    link: '/ru/System/'
  },
  {
    text: 'Разработка драйверов',
    link: '/ru/Devicedriver/'
  },
  {
    text: 'Специальные темы',
    link: '/ru/Special/'
  },
  {
    text: `Серия Allwinner`,
    children: [
      {
        text: 'Плата T113-Pro',
        link: '/ru/advanced/cookbook/',
      },
      {
        text: 'Плата V853',
        link: '/ru/advanced/cookbook/',
      },
      {
        text: 'Плата R818',
        link: '/ru/advanced/cookbook/',
      },
    ],
  },
]
