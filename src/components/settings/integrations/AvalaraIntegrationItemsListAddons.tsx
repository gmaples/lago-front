import { gql } from '@apollo/client'
import { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'

import { InfiniteScroll } from '~/components/designSystem'
import { GenericPlaceholder } from '~/components/GenericPlaceholder'
import { CREATE_ADD_ON_ROUTE } from '~/core/router'
import {
  GetAddOnsForAvalaraItemsListQuery,
  InputMaybe,
  MappableTypeEnum,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import EmptyImage from '~/public/images/maneki/empty.svg'
import ErrorImage from '~/public/images/maneki/error.svg'

import { AvalaraIntegrationMapItemDialogRef } from './AvalaraIntegrationMapItemDialog'
import IntegrationItemHeader from './IntegrationItemHeader'
import IntegrationItemLine from './IntegrationItemLine'

gql`
  fragment AvalaraIntegrationItemsListAddons on AddOn {
    id
    name
    code
    integrationMappings(integrationId: $integrationId) {
      id
      externalId
      externalAccountCode
      externalName
      mappableType
    }
  }
`

type AvalaraIntegrationItemsListAddonsProps = {
  data: GetAddOnsForAvalaraItemsListQuery | undefined
  fetchMoreAddons: Function
  hasError: boolean
  integrationId: string
  searchTerm: InputMaybe<string> | undefined
  isLoading: boolean
  avalaraIntegrationMapItemDialogRef: RefObject<AvalaraIntegrationMapItemDialogRef>
}

const AvalaraIntegrationItemsListAddons = ({
  data,
  fetchMoreAddons,
  hasError,
  integrationId,
  isLoading,
  avalaraIntegrationMapItemDialogRef,
  searchTerm,
}: AvalaraIntegrationItemsListAddonsProps) => {
  const navigate = useNavigate()
  const { translate } = useInternationalization()
  const addons = data?.addOns?.collection || []

  return (
    <div className="flex flex-col">
      <IntegrationItemHeader columnName={translate('text_6630ea71a6c2ef00bc63006f')} />
      {!!isLoading && !addons.length && searchTerm ? (
        <>
          {[0, 1, 2].map((i) => (
            <IntegrationItemLine
              key={`addon-item-skeleton-${i}`}
              icon="puzzle"
              label={''}
              description={''}
              loading={true}
            />
          ))}
        </>
      ) : !isLoading && !!hasError ? (
        <>
          {!!searchTerm ? (
            <GenericPlaceholder
              title={translate('text_623b53fea66c76017eaebb6e')}
              subtitle={translate('text_63bab307a61c62af497e0599')}
              image={<ErrorImage width="136" height="104" />}
            />
          ) : (
            <GenericPlaceholder
              title={translate('text_629728388c4d2300e2d380d5')}
              subtitle={translate('text_629728388c4d2300e2d380eb')}
              buttonTitle={translate('text_629728388c4d2300e2d38110')}
              buttonVariant="primary"
              buttonAction={() => location.reload()}
              image={<ErrorImage width="136" height="104" />}
            />
          )}
        </>
      ) : !isLoading && (!addons || !addons.length) ? (
        <>
          {!!searchTerm ? (
            <GenericPlaceholder
              title={translate('text_63bee4e10e2d53912bfe4da5')}
              subtitle={translate('text_63bee4e10e2d53912bfe4da7')}
              image={<EmptyImage width="136" height="104" />}
            />
          ) : (
            <GenericPlaceholder
              title={translate('text_629728388c4d2300e2d380c9')}
              subtitle={translate('text_629728388c4d2300e2d380df')}
              buttonTitle={translate('text_629728388c4d2300e2d3810f')}
              buttonVariant="primary"
              buttonAction={() => navigate(CREATE_ADD_ON_ROUTE)}
              image={<EmptyImage width="136" height="104" />}
            />
          )}
        </>
      ) : (
        <InfiniteScroll
          onBottom={() => {
            const { currentPage = 0, totalPages = 0 } = data?.addOns?.metadata || {}

            currentPage < totalPages &&
              !isLoading &&
              fetchMoreAddons({
                variables: { page: currentPage + 1 },
              })
          }}
        >
          <>
            {!!addons.length &&
              addons.map((addOn) => {
                const addonMapping = addOn?.integrationMappings?.find(
                  (i) => i.mappableType === MappableTypeEnum.AddOn,
                )

                return (
                  <IntegrationItemLine
                    key={`addon-item-${addOn.id}`}
                    icon="puzzle"
                    label={addOn.name}
                    description={addOn.code}
                    loading={false}
                    onMappingClick={() => {
                      avalaraIntegrationMapItemDialogRef.current?.openDialog({
                        integrationId,
                        type: MappableTypeEnum.AddOn,
                        itemId: addonMapping?.id,
                        itemExternalId: addonMapping?.externalId,
                        itemExternalName: addonMapping?.externalName || undefined,
                        lagoMappableId: addOn.id,
                        lagoMappableName: addOn.name,
                      })
                    }}
                    mappingInfos={
                      !!addonMapping?.id
                        ? {
                            id: addonMapping.externalId,
                            name: addonMapping.externalName || '',
                          }
                        : undefined
                    }
                  />
                )
              })}
            {isLoading &&
              [0, 1, 2].map((i) => (
                <IntegrationItemLine
                  key={`addon-item-skeleton-${i}`}
                  icon="puzzle"
                  label={''}
                  description={''}
                  loading={true}
                />
              ))}
          </>
        </InfiniteScroll>
      )}
    </div>
  )
}

export default AvalaraIntegrationItemsListAddons
