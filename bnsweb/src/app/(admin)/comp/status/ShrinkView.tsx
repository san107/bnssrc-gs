import { styled } from '@mui/material/styles';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface ShrinkProps extends IconButtonProps {
  shrink: boolean;
}

const Shrink = styled((props: ShrinkProps) => {
  const { shrink, ...other } = props;
  return <IconButton disableFocusRipple={shrink} {...other} />;
})(({ theme, shrink }) => ({
  transform: !shrink ? 'rotate(180deg)' : 'rotate(0deg)',
  marginLeft: 'auto',
  pointerEvents: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

type Props = {
  shrink: boolean;
  setShrink: (b: boolean) => void;
};

const ShrinkView = ({ shrink, setShrink }: Props) => {
  const handleShrinkClick = () => {
    setShrink(!shrink);
  };
  return (
    <Shrink shrink={shrink} onClick={handleShrinkClick} aria-expanded={shrink}>
      <ChevronLeftIcon
        sx={{ color: '#2e4a8f', border: '1px solid #2e4a8f', borderRadius: '50%' }}
      />
    </Shrink>
  );
};

export default ShrinkView;
