import { useQuery } from 'wagmi'

import { TLD } from '@ensdomains/ensjs/utils/consts'

import { isDnsSecEnabled } from '@app/components/pages/import/[name]/utils'
import { useQueryKeys } from '@app/utils/cacheKeyFactory'

export const useSupportsTLD = (name = '') => {
  const labels = name?.split('.') || []
  const tld = labels[labels.length - 1]
  return useQuery(
    useQueryKeys().isSupportedTLD(tld),
    async () => {
      // if using "[root]", not really a valid TLD but return true for display purposes
      if (tld === '[root]' || tld === TLD) return true
      const isSupported = await isDnsSecEnabled(tld)
      return isSupported
    },
    {
      enabled: !!tld,
    },
  )
}
