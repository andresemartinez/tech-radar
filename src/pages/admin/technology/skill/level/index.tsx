import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import Link from 'next/link';

const TechnologySkillsLevelAdminPage: NextPageWithLayout = () => {
  const { data: technologySkillsLevel } = trpc.useQuery([
    'technology-skill-level.all',
  ]);

  return (
    <div>
      {technologySkillsLevel?.map((technologySkillLevel) => (
        <Link
          key={technologySkillLevel.id}
          href={{
            pathname: '/admin/technology/skill/level/[id]',
            query: { id: technologySkillLevel.id },
          }}
        >
          <a>{technologySkillLevel.name}</a>
        </Link>
      ))}
    </div>
  );
};

export default TechnologySkillsLevelAdminPage;
