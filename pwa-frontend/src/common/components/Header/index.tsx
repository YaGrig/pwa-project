import { Box } from "@mui/material";
import Link from "@mui/material/Link";
import { useLoginForm } from "../../../features/authorization/lib/hooks/useLoginForm";

export const Header = () => {
  const { openModal } = useLoginForm();
  const handleClick = () => {
    openModal(true);
  };

  return (
    <header>
      <Box>
        <Link
          color="primary"
          underline="hover"
          variant="button"
          sx={{ backgroundColor: "primary" }}
        >
          <span onClick={handleClick}>Login</span>
        </Link>
      </Box>
    </header>
  );
};
