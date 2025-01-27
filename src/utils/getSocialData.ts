export const getSocialData = (iconKey: string, value: string) => {
  switch (iconKey) {
    case 'twitter':
    case 'com.twitter':
      return {
        icon: 'com.twitter',
        color: '#65C5FC',
        label: 'Twitter',
        value: `@${value.replace(/^@/, '')}`,
        type: 'link',
        urlFormatter: `https://twitter.com/${value.replace(/^@/, '')}`,
      }
    case 'github':
    case 'com.github':
      return {
        icon: 'com.github',
        color: '#000000',
        label: 'GitHub',
        value,
        type: 'link',
        urlFormatter: `https://github.com/${value}`,
      }
    case 'discord':
    case 'com.discord':
      return {
        icon: 'com.discord',
        color: '#5A57DD',
        label: 'Discord',
        value,
        type: 'copy',
      }
    case 'telegram':
    case 'org.telegram':
      return {
        icon: 'org.telegram',
        color: '#2BABEE',
        label: 'Telegram',
        value,
        type: 'link',
        urlFormatter: `https://t.me/${value}`,
      }
    default:
      return null
  }
}
