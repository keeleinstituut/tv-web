import {
  ExternalVendorInstitution,
  ProjectRequest,
  ProjectRequestStatus,
} from 'types/projectRequests'

export const MOCK_EXTERNAL_VENDOR_INSTITUTIONS: ExternalVendorInstitution[] = [
  {
    id: 'evi-1',
    name: 'Tõlkes Kaduma Läinud OÜ',
    email: 'info@tolkeskaduma.ee',
    phone: '+372 555 1111',
  },
  {
    id: 'evi-2',
    name: 'Kadunud Komade Büroo',
    email: 'info@kadunudkomad.ee',
    phone: '+372 555 2222',
  },
  {
    id: 'evi-3',
    name: 'Tõlkes Leitud OÜ',
    email: 'info@tolkesleitud.ee',
    phone: '+372 555 3333',
  },
  {
    id: 'evi-4',
    name: 'Punkti ja Koma Agentuur',
    email: 'info@punktikomad.ee',
    phone: '+372 555 4444',
  },
  {
    id: 'evi-5',
    name: 'Sõnatäpne Tõlkebüroo OÜ',
    email: 'info@sonatapne.ee',
    phone: '+372 555 5555',
  },
  {
    id: 'evi-6',
    name: 'Keelevald MTÜ',
    email: 'info@keelevald.ee',
    phone: '+372 555 6666',
  },
]

const makeMock = (
  index: number,
  status: ProjectRequestStatus,
  overrides: Partial<ProjectRequest> = {}
): ProjectRequest => ({
  id: `pr-mock-${index}`,
  assignment_id: `assignment-${index}`,
  project_id: `project-${index}`,
  project_ext_id: `TV-2026-${String(index).padStart(4, '0')}`,
  project_type_name: index % 2 === 0 ? 'Tõlkimine' : 'Toimetamine',
  language_pair:
    index % 3 === 0 ? 'ET → EN' : index % 3 === 1 ? 'EN → ET' : 'ET → RU',
  cascade_mode: false,
  response_deadline_at: '2026-05-25T14:00:00Z',
  special_instructions: 'Tegemist on tellimusega.',
  include_project_files: true,
  include_price: true,
  recipients: [
    {
      id: `rec-${index}`,
      external_vendor_institution_id: 'evi-1',
      institution_name: 'Tõlkes Kaduma Läinud OÜ',
      email: 'info@tolkeskaduma.ee',
      priority: 0,
      status,
    },
  ],
  status,
  created_at: '2026-05-10T10:00:00Z',
  requestor_institution_name: index % 2 === 0 ? 'EKI' : 'Eesti Keele Instituut',
  requestor_email: index % 2 === 0 ? 'tolkevarav@eki.ee' : 'info@eki.ee',
  ...overrides,
})

export const MOCK_PROJECT_REQUESTS: ProjectRequest[] = [
  makeMock(1, ProjectRequestStatus.Pending),
  makeMock(2, ProjectRequestStatus.Accepted),
  makeMock(3, ProjectRequestStatus.Responded),
  makeMock(4, ProjectRequestStatus.Declined),
  makeMock(5, ProjectRequestStatus.Expired),
  makeMock(6, ProjectRequestStatus.Cancelled),
  makeMock(7, ProjectRequestStatus.Pending),
  makeMock(8, ProjectRequestStatus.Accepted),
  makeMock(9, ProjectRequestStatus.Pending),
  makeMock(10, ProjectRequestStatus.Responded),
]
