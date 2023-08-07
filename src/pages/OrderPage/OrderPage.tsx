import Loader from 'components/atoms/Loader/Loader'
import { useFetchOrder, useFetchSubProject, useSubProjectSendToCat } from 'hooks/requests/useOrders'
import { FC, Fragment, useState } from 'react'
import { includes, find, map, chain, assign, filter, split, zip } from 'lodash'
import { useParams } from 'react-router-dom'
import classes from './classes.module.scss'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import { OrderStatus } from 'types/orders'
import Tag from 'components/atoms/Tag/Tag'
import Tabs from 'components/molecules/Tabs/Tabs'
import SimpleDropdown from 'components/molecules/SimpleDropdown/SimpleDropdown'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import ConfirmationModalBase from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import _ from 'lodash'

// TODO: WIP - implement this page

interface OrderButtonProps {
  status?: OrderStatus
  isPersonalOrder?: boolean
  //
}

const OrderButtons: FC<OrderButtonProps> = ({ status, isPersonalOrder }) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const isOrderCancellable = includes(
    [OrderStatus.New, OrderStatus.Registered],
    status
  )
  const canCancelPersonalOrder =
    includes(userPrivileges, Privileges.ViewPersonalProject) && isPersonalOrder

  const canCancelInstitutionOrder =
    status === OrderStatus.New &&
    (includes(userPrivileges, Privileges.ManageProject) ||
      includes(userPrivileges, Privileges.ReceiveAndManageProject))

  //   RECEIVE_AND_MANAGE_PROJECT or MANAGE_PROJECT

  // const userHasPrivilege =
  //   !privileges ||
  //   find([Privileges.ReceiveAndManageProject, Privileges.ManageProject], (privilege) => includes(userPrivileges, privilege))

  //   RECEIVE_AND_MANAGE_PROJECT or MANAGE_PROJECT

  const canCancelOrder =
    isOrderCancellable && (canCancelPersonalOrder || canCancelInstitutionOrder)
  // TODO: mapped buttons:
  // Left:
  // 1. Delegate to other manager (Registreeritud status + )
  // Right:
  // 1. Cancel order --
  if (!status) return null
  return (
    <div className={classes.buttonsContainer}>
      <Button
        appearance={AppearanceTypes.Secondary}
        children={t('button.delegate_to_other_manager')}
        // TODO: disabled for now, we don't have endpoint for this
        // open confirmation modal from here
        disabled
      // hidden={!includes(userPrivileges, Privileges.DeactivateUser)}
      />
      <Button
        // loading={isArchiving}
        appearance={AppearanceTypes.Primary}
        children={t('button.cancel_order')}
        // onClick={handleArchiveModal}
        hidden={!canCancelOrder}
      />
    </div>
  )
}

const OrderPage: FC = () => {
  const { t } = useTranslation()
  const { orderId } = useParams()
  const { order, isLoading } = useFetchOrder({ orderId })
  const { id, status } = order || {}
  // TODO: check is "Tellija" of the order is current user
  const isPersonalOrder = true
  console.warn('orderPage', orderId, order)
  if (isLoading) return <Loader loading={isLoading} />
  return (
    <div>
      <div className={classes.titleRow}>
        <h1>{id}</h1>
        <OrderButtons {...{ status, isPersonalOrder }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h5>Tellija andmed</h5>
          <span>Nimi: 1</span>
          <span>Asutus: 2</span>
          <span>Üksus: 3</span>
          <span>Meiliaadress: 4</span>
          <span>Telefoninumber: 5</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h5>Tõlkekorraldaja andmed</h5>
          <span>Nimi: 1</span>
          <span>Asutus: 2</span>
          <span>Üksus: 3</span>
          <span>Meiliaadress: 4</span>
          <span>Telefoninumber: 5</span>
        </div>
      </div>
      <br></br>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h5>Tellimuse andmed</h5>
          <span>Tellimuse ID: {order?.ext_id}</span>
          <span>Valdkond: 2</span>
          <span>Tellimuse tüüp: {order?.type_classifier_value?.name}</span>
          <span>Tähtaeg: 4</span>
          <span>Lisainfo: 5</span>
          <span>Viitenumber: {order?.reference_number}</span>
          <span>Algkeel: {chain(order?.sub_projects).map('source_language_classifier_value').map('name').uniq().join(', ').value()}</span>
          <span>Sihtkeel(ed): {chain(order?.sub_projects).map('destination_language_classifier_value').map('name').uniq().join(', ').value()}</span>
          <span>Tellimuse sildid: 9</span>
          <span>Loomise aeg: {order?.created_at}</span>
          <span>Tühistamise aeg: 11</span>
          <span>Tagasilükkamise aeg: 12</span>
          <span>Korrektuuride tegemise aeg: 13</span>
          <span>Vastuvõtmise aeg: 14</span>
        </div>
        <div style={{ flex: 1 }}>
          <h5>Failid</h5>
          <h6>Lähtefailid</h6>
          <div>
            <table>
              <tbody>
                {map(order?.source_files, (file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{file.updated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h6>Abifailid</h6>
          <div>
            <table>
              <tbody>
                {map(order?.help_files, (file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{file.updated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <br />
        {chain(order?.sub_projects)
          .sortBy('ext_id')
          .map((subProject) => {
            return (
              <div key={subProject.id}>
                <SubProject id={subProject.id} />
                <br />
                <br />
                <br />
                <br />
                <br />
              </div>
            )
          })
          .value()
        }
      </div>
    </div>
  )
}

export default OrderPage


interface ObjectType {
  [key: string]: string
}

const SubProject: FC<any> = (props) => {
  const { id } = props

  const [tabNames, setTabNames] = useState<ObjectType>({})
  const [activeTab, setActiveTab] = useState<string>()

  const { subProject, isLoading } = useFetchSubProject({ id })

  if (isLoading) return <Loader loading={isLoading} />

  const keelesuunad = `${subProject?.destination_language_classifier_value.value} > ${subProject?.source_language_classifier_value.value}`

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1>{id}</h1>
        <span>
          keelesuunad: <Tag label={keelesuunad} value />
        </span>
        <span>
          alamtellimuse ID: {subProject.ext_id}
        </span>
        <span style={{ color: 'red' }}>
          maksumus: {'// TODO: '}
        </span>
        <span style={{ color: 'red' }}>
          tähtaeg: {'// TODO: '}
        </span>
      </div>
      <Tabs
        setActiveTab={setActiveTab}
        tabs={chain((Feature as any).supportedFeatures)
          .filter(feature => includes(['general_information', ...subProject.features], feature))
          .map(feature => ({
            id: feature,
            name: feature,
          }))
          .value()
        }
        onAddPress={function (): void {
          throw new Error('Function not implemented.')
        }}
        addLabel={''}
        onChangeName={function (id: string, newValue: string): void {
          throw new Error('Function not implemented.')
        }}
        addDisabled={true}
        tabNames={tabNames}
      />

      <Feature subProject={subProject} feature={activeTab} />

      {/* <pre>
        {JSON.stringify(subProject, null, 2)}
      </pre> */}
    </>
  )
}

const Feature: FC<any> = (props) => {
  const { subProject, feature } = props
  let Component = null;

  switch (feature) {
    case 'general_information':
      Component = GeneralInformation
      break;
    case 'job_translation':
      Component = TranslationFeature
      break;
    case 'job_revision':
      Component = RevisionFeature
      break;
    case 'job_overview':
      Component = OverviewFeature
      break;

    default:
      break;
  }

  if (!Component) {
    return <></>;
  }

  return <Component {...props} />
}

(Feature as any).supportedFeatures = [
  'general_information',
  'job_translation',
  'job_revision',
  'job_overview',
]

const GeneralInformation: FC<any> = (props) => {
  const { subProject, feature } = props;
  const catSupported = includes(subProject.cat_features, feature);
  const { sendToCat } = useSubProjectSendToCat({ id: subProject.id })


  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          feature: {feature}
        </span>
        <span>
          catSupported: {String(catSupported)}
        </span>
        <span>
          catProjectCreated: {String(subProject.cat_project_created)}
        </span>
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
              {map(subProject.cat_jobs, (catJob) => {
                const { xliff_download_url } = catJob
                const name = xliff_download_url.substring(xliff_download_url.lastIndexOf('/' + 1)).replace('/', '')
                return (
                  <tr key={name}>
                    <td>
                      {name}
                    </td>
                    <td>
                      {/* {file.updated_at} */}
                      {'Some percentage'}
                    </td>
                    <td>
                      <Button href={catJob.translate_url} target='_blank'>
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
                                  console.warn('PROCEED splitting with amount: ' + splitsAmount)
                                }
                              })
                            },
                          },
                          {
                            label: 'Laadi alla XLIFF',
                            href: catJob.xliff_download_url,
                          },
                          {
                            label: 'Laadi alla valmis tõlge',
                            href: catJob.translation_download_url,
                          },
                          {
                            label: 'Ühenda failid kokku',
                            onClick: () => {
                              showModal(ModalTypes.CatMerge, {
                                handleMerge: () => {
                                  console.warn('PROCEED with merging')
                                }
                              })
                            },
                          },
                        ]}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Button
            appearance={AppearanceTypes.Text}
            onClick={() => {

              const totalWordCount = chain(subProject.cat_analyzis).map('raw_word_count').sum().value()
              const columns = [
                ['Kokku', '101%', 'Kordused', '100%', '95-99%', '85-94%', '75-84%', '50-74%', '0-49%'],
                ...map(subProject.cat_analyzis, (chunk) => [
                  chunk.total,
                  chunk.tm_101,
                  chunk.tm_repetitions,
                  chunk.tm_100,
                  chunk.tm_95_99,
                  chunk.tm_85_94,
                  chunk.tm_75_84,
                  chunk.tm_50_74,
                  chunk.tm_0_49,
                ])
              ]
              const rows = zip.apply(_, columns);

              showModal(ModalTypes.Tooltip, {
                modalContent: (
                  <>
                    <h1>Mahu analüüs valitud failidele</h1>
                    <h6>
                      Analüüsitud sõnu kokku {totalWordCount}
                    </h6>
                    <table>
                      <thead>
                        <tr>
                          <th>Vaste tüüp</th>
                          {map(subProject.cat_analyzis, chunk => (
                            <th key={chunk.chunk_id}>Nimi: {chunk.chunk_id}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {map(rows, (row, i) => (
                          <tr key={i}>
                            {map(row, (column: string, j: number) => (
                              <td key={j}>
                                {column}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )
              })
            }}>
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
              {map(subProject.source_files, (file) => {
                return (
                  <tr key={file.id}>
                    <td>
                      {file.file_name}
                    </td>
                    <td>
                      {file.updated_at}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!subProject.cat_project_created && (
            <Button onClick={() => sendToCat({})}>genereeri tõlkimiseks</Button>
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
              {map(subProject.final_files, (file) => {
                return (
                  <tr key={file.id}>
                    <td>
                      {file.file_name}
                    </td>
                    <td>
                      {file.updated_at}
                    </td>
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


const TranslationFeature: FC<any> = (props) => {
  const { subProject, feature } = props;
  const catSupported = includes(subProject.cat_features, feature);
  const featureAssignments = filter(subProject.assignments, (assignment) => {
    return assignment.feature === feature;
  })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          feature: {feature}
        </span>
        <span>
          catSupported: {String(catSupported)}
        </span>
      </div>
      <br />
      {map(featureAssignments, (assignment, i) => {
        return (
          <Assignment key={assignment.id} assignment={assignment} index={i + 1} label="Tõlkimine" />
        )
      })}
    </>
  )
}

const RevisionFeature: FC<any> = (props) => {
  const { subProject, feature } = props;
  const catSupported = includes(subProject.cat_features, feature);
  const featureAssignments = filter(subProject.assignments, (assignment) => {
    return assignment.feature === feature;
  })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          feature: {feature}
        </span>
        <span>
          catSupported: {String(catSupported)}
        </span>
      </div>
      <br />
      {map(featureAssignments, (assignment, i) => {
        return (
          <Assignment key={assignment.id} assignment={assignment} index={i + 1} label="Toimetamine" />
        )
      })}
    </>
  )
}

const OverviewFeature: FC<any> = (props) => {
  const { subProject, feature } = props;
  const catSupported = includes(subProject.cat_features, feature);
  const featureAssignments = filter(subProject.assignments, (assignment) => {
    return assignment.feature === feature;
  })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          feature: {feature}
        </span>
        <span>
          catSupported: {String(catSupported)}
        </span>
      </div>
      {map(featureAssignments, (assignment, i) => {
        return (
          <Assignment key={assignment.id} assignment={assignment} index={i + 1} label="Ülevaatus" />
        )
      })}
    </>
  )
}

const Assignment: FC<any> = (props) => {
  const { assignment, index, label } = props

  return (
    <Fragment>
      <h3>Teostaja {index} ({label})</h3>
      <div key={assignment.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{ color: 'red' }}>
            deadline:
          </span>
          <span style={{ color: 'red' }}>
            erijuhised tellimuse kohta:
          </span>
          <span style={{ color: 'red' }}>
            maht:
          </span>
          <span style={{ color: 'red' }}>
            teostaja märkused:
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <h1>Teostajad</h1>
          <table>
            <thead>
              <tr>
                <th>Nimi</th>
                <th>Staatus</th>
                <th style={{ color: 'red' }}>Maksumus</th>
              </tr>
            </thead>
            <tbody>
              {map(assignment.candidates, (candidate) => {
                const { institution_user } = candidate.vendor
                const name = `${institution_user.user.forename} ${institution_user.user.surname}`
                let status = '-'
                console.log('--------------------------------------------------------------------')
                console.log(assignment.assigned_vendor_id)
                console.log(candidate.vendor_id)
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                if (!assignment.assignee_id) {
                  status = 'Teostajale edastatud'
                }
                if (assignment.assigned_vendor_id == candidate.vendor_id) {
                  status = 'Teostamisel'
                } else {
                  status = 'Mitte valitud'
                }
                return (
                  <tr key={candidate.id}>
                    <td>
                      {name}
                    </td>
                    <td>
                      {status}
                    </td>
                    <td>
                      {candidate.price}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(!assignment.somethingsomething || true) && (
            <Button onClick={() => { }}>Saada pakkumus</Button>
          )}
          {/* {!subProject.cat_project_created && (
            <Button onClick={() => {}}>genereeri tõlkimiseks</Button>
          )} */}
        </div>
      </div>
    </Fragment>
  )
}