import { FC } from 'react'
import { chain, map, zip } from 'lodash'
import { useSubOrderSendToCat } from 'hooks/requests/useOrders'
import { SubOrderDetail } from 'types/orders'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import SimpleDropdown from 'components/molecules/SimpleDropdown/SimpleDropdown'

import classes from './classes.module.scss'

// TODO: this is WIP code for suborder view

type GeneralInformationFeatureProps = Pick<
  SubOrderDetail,
  | 'cat_project_created'
  | 'cat_jobs'
  | 'cat_analyzis'
  | 'source_files'
  | 'final_files'
> & {
  catSupported?: boolean
  subOrderId: string
}

const GeneralInformationFeature: FC<GeneralInformationFeatureProps> = ({
  catSupported,
  cat_project_created,
  cat_jobs,
  subOrderId,
  cat_analyzis,
  source_files,
  final_files,
}) => {
  const { sendToCat } = useSubOrderSendToCat({ id: subOrderId })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>feature: GeneralInformationFeature</span>
        <span>catSupported: {String(catSupported)}</span>
        <span>catProjectCreated: {String(cat_project_created)}</span>
      </div>
      <br />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h1>Lähtefailid tõlketööriistas</h1>
          <table>
            <thead>
              <tr>
                <th>XLIFFi nimi</th>
                <th>Segmendid</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {map(
                cat_jobs,
                ({
                  translate_url,
                  xliff_download_url,
                  translation_download_url,
                }) => {
                  const name = xliff_download_url
                    .substring(xliff_download_url.lastIndexOf('/' + 1))
                    .replace('/', '')
                  return (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>
                        {/* {file.updated_at} */}
                        {'Some percentage'}
                      </td>
                      <td>
                        <Button href={translate_url} target="_blank">
                          Ava tõlketööriistas
                        </Button>
                      </td>
                      <td>
                        <SimpleDropdown
                          title={''}
                          label={'options'}
                          options={[
                            {
                              label: 'Jaga fail tükkideks',
                              onClick: () => {
                                showModal(ModalTypes.CatSplit, {
                                  handleSplit: (splitsAmount: number) => {
                                    console.warn(
                                      'PROCEED splitting with amount: ' +
                                        splitsAmount
                                    )
                                  },
                                })
                              },
                            },
                            {
                              label: 'Laadi alla XLIFF',
                              href: xliff_download_url,
                            },
                            {
                              label: 'Laadi alla valmis tõlge',
                              href: translation_download_url,
                            },
                            {
                              label: 'Ühenda failid kokku',
                              onClick: () => {
                                showModal(ModalTypes.CatMerge, {
                                  handleMerge: () => {
                                    console.warn('PROCEED with merging')
                                  },
                                })
                              },
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  )
                }
              )}
            </tbody>
          </table>
          <Button
            appearance={AppearanceTypes.Text}
            onClick={() => {
              const totalWordCount = chain(cat_analyzis)
                .map('raw_word_count')
                .sum()
                .value()
              const columns = [
                [
                  'Kokku',
                  '101%',
                  'Kordused',
                  '100%',
                  '95-99%',
                  '85-94%',
                  '75-84%',
                  '50-74%',
                  '0-49%',
                ],
                ...map(cat_analyzis, (chunk) => [
                  chunk.total,
                  chunk.tm_101,
                  chunk.tm_repetitions,
                  chunk.tm_100,
                  chunk.tm_95_99,
                  chunk.tm_85_94,
                  chunk.tm_75_84,
                  chunk.tm_50_74,
                  chunk.tm_0_49,
                ]),
              ]
              const rows = zip(columns)

              showModal(ModalTypes.Tooltip, {
                modalContent: (
                  <>
                    <h1>Mahu analüüs valitud failidele</h1>
                    <h6>Analüüsitud sõnu kokku {totalWordCount}</h6>
                    <table>
                      <thead>
                        <tr>
                          <th>Vaste tüüp</th>
                          {map(cat_analyzis, (chunk) => (
                            <th key={chunk.chunk_id}>Nimi: {chunk.chunk_id}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {map(rows, (row, i) => (
                          <tr key={i}>
                            {map(row, (column: string, j: number) => (
                              <td key={j}>{column}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ),
              })
            }}
          >
            Vaata CAT arvestust
          </Button>

          <h1>Lähtefailid</h1>
          <table>
            <thead>
              <tr>
                <th>Faili nimi</th>
                <th>Viimati uuendatud</th>
              </tr>
            </thead>
            <tbody>
              {map(source_files, (file) => {
                return (
                  <tr key={file.id}>
                    <td>{file.file_name}</td>
                    <td>{file.updated_at}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!cat_project_created && (
            <Button
              onClick={() =>
                sendToCat({
                  id: 'asd',
                })
              }
            >
              genereeri tõlkimiseks
            </Button>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1>Valmisfailid teostajatelt</h1>
          <table>
            <thead>
              <tr>
                <th>Faili nimi</th>
                <th>Viimati uuendatud</th>
              </tr>
            </thead>
            <tbody>
              {map(final_files, (file) => {
                return (
                  <tr key={file.id}>
                    <td>{file.file_name}</td>
                    <td>{file.updated_at}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default GeneralInformationFeature
