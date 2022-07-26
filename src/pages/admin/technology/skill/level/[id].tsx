import { useRouter } from "next/router";
import { NextPageWithLayout } from "~/pages/_app";
import { useMemo } from 'react';
import { trpc } from "~/utils/trpc";
import { TextField } from "@mui/material";

const TechnologySkillLevelAdminPage: NextPageWithLayout = () => {

    const router = useRouter();
    const id = useMemo(
        () => (typeof router.query.id === 'string' ? router.query.id : ''),
        [router.query.id],
      );
      
      const { data: skillLevel } = trpc.useQuery(['technology-skill-level.byId', { id }]);

      return (
        <form>
          <br />
          <TextField
            id="name"
            name="name"
            label="Nombre"
            variant="outlined"
            required
            value={skillLevel?.name}
          ></TextField>
          <TextField
            id="weight"
            name="weight"
            label="Peso"
            variant="outlined"
            required
            value={skillLevel?.weight}
          ></TextField>
        </form>
      );
}

export default TechnologySkillLevelAdminPage;