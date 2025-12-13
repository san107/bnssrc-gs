import { styled } from '@mui/material/styles';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface ExpandProps extends IconButtonProps {
  expand: boolean;
}

const Expand = styled((props: ExpandProps) => {
  const { expand, ...other } = props;
  return <IconButton disableFocusRipple={expand} {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(180deg)' : 'rotate(0deg)',
  marginLeft: 'auto',
  pointerEvents: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

type Props = {
  expand: boolean;
  setExpand: (b: boolean) => void;
};

const ExpandView = ({ expand, setExpand }: Props) => {
  const handleClickExpand = () => {
    setExpand(!expand);
    const status = document.getElementById('status-header');
    if (expand) {
      if (status) status?.classList.add('hide');
    } else {
      if (status) status?.classList.remove('hide');
    }
  };
  return (
    <div className='stat-expand-view'>
      <Expand expand={expand} onClick={handleClickExpand} aria-expanded={expand}>
        <ChevronLeftIcon
          sx={{
            color: '#fff',
            backgroundColor: 'rgb(255, 111, 0)',
            borderRadius: '50%',
          }}
        />
      </Expand>
    </div>
  );
};

export default ExpandView;
