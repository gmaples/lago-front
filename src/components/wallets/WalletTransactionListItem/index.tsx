import { gql } from '@apollo/client'

import { ListItem } from '~/components/wallets/WalletTransactionListItem/ListItem'
import { intlFormatNumber } from '~/core/formats/intlFormatNumber'
import {
  TimezoneEnum,
  WalletTransactionForTransactionListItemFragment,
  WalletTransactionStatusEnum,
  WalletTransactionTransactionStatusEnum,
  WalletTransactionTransactionTypeEnum,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useCurrentUser } from '~/hooks/useCurrentUser'

gql`
  fragment WalletTransactionForTransactionListItem on WalletTransaction {
    id
    status
    transactionStatus
    transactionType
    amount
    creditAmount
    settledAt
    failedAt
    createdAt
    wallet {
      id
      currency
    }
  }
`

type LocalWalletTransaction = Omit<
  WalletTransactionForTransactionListItemFragment,
  'transactionStatus'
> & {
  transactionStatus: WalletTransactionTransactionStatusEnum | undefined
}

export type WalletTransactionListItemProps = {
  customerTimezone: TimezoneEnum | undefined
  isRealTimeTransaction?: boolean
  transaction: LocalWalletTransaction
  isWalletActive: boolean
  onClick?: () => void
}

export const WalletTransactionListItem = ({
  customerTimezone,
  isRealTimeTransaction,
  transaction,
  isWalletActive,
  ...props
}: WalletTransactionListItemProps) => {
  const { isPremium } = useCurrentUser()
  const { translate } = useInternationalization()

  const blurValue = !isPremium && isRealTimeTransaction
  const {
    id,
    amount,
    createdAt,
    creditAmount,
    settledAt,
    failedAt,
    status,
    transactionType,
    transactionStatus,
  } = transaction
  const isPending = status === WalletTransactionStatusEnum.Pending
  const isFailed = status === WalletTransactionStatusEnum.Failed
  const isInbound = transactionType === WalletTransactionTransactionTypeEnum.Inbound

  const formattedCreditAmount = intlFormatNumber(Number(blurValue ? 0 : creditAmount) || 0, {
    maximumFractionDigits: 15,
    style: 'decimal',
  })

  const formattedCurrencyAmount = intlFormatNumber(Number(blurValue ? 0 : amount) || 0, {
    currencyDisplay: 'symbol',
    maximumFractionDigits: 15,
    currency: transaction?.wallet?.currency,
  })

  const transactionAmountTranslationKey = translate(
    'text_62da6ec24a8e24e44f812896',
    {
      amount: formattedCreditAmount,
    },
    Number(creditAmount) || 0,
  )

  if (isRealTimeTransaction) {
    return (
      <ListItem
        {...props}
        isBlurry={!isPremium}
        iconName="pulse"
        timezone={customerTimezone}
        labelColor="grey600"
        label={translate('text_65ae9a58ed65be00a35a0d72')}
        creditsColor="grey600"
        credits={transactionAmountTranslationKey}
        amount={formattedCurrencyAmount}
        hasAction={false}
        transactionId={id}
      />
    )
  }

  if (isInbound) {
    return (
      <ListItem
        {...props}
        status={status}
        iconName="plus"
        timezone={customerTimezone}
        labelColor="grey700"
        label={
          transactionStatus === WalletTransactionTransactionStatusEnum.Granted
            ? translate('text_662fc05d2cfe3a0596b29db0', undefined, Number(creditAmount) || 0)
            : translate('text_62da6ec24a8e24e44f81289a', undefined, Number(creditAmount) || 0)
        }
        date={(isPending && settledAt) || (isFailed && failedAt) || createdAt}
        creditsColor="success600"
        credits={`${Number(creditAmount) === 0 ? '' : '+ '} ${transactionAmountTranslationKey}`}
        amount={formattedCurrencyAmount}
        hasAction={isWalletActive}
        transactionId={id}
      />
    )
  }

  if (!isInbound)
    return (
      <ListItem
        {...props}
        status={status}
        iconName="minus"
        timezone={customerTimezone}
        labelColor="grey700"
        label={
          transactionStatus === WalletTransactionTransactionStatusEnum.Voided
            ? translate('text_662fc05d2cfe3a0596b29d98', undefined, Number(creditAmount) || 0)
            : translate('text_62da6ec24a8e24e44f812892', undefined, Number(creditAmount) || 0)
        }
        date={(isPending && settledAt) || (isFailed && failedAt) || createdAt}
        creditsColor="grey700"
        credits={`${Number(creditAmount) === 0 ? '' : '- '} ${transactionAmountTranslationKey}`}
        amount={formattedCurrencyAmount}
        hasAction={isWalletActive}
        transactionId={id}
      />
    )

  return null
}

WalletTransactionListItem.displayName = 'WalletTransactionListItem'
