import { Box, Button, Card, styled, Typography } from '@mui/material';

const Container = styled(Box)`
  border-top: 1px solid #ddd;
  padding: 16px;
  background-color: #f8fafc;
  height: fit-content;
  min-width: 700px;
`;

const MainContent = styled(Box)`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const CameraSection = styled(Box)`
  flex: 2;
  min-height: 300px;
  display: flex;
  align-items: center;
`;

const StatusSection = styled(Box)`
  flex: 1;
  min-width: 260px;
`;

const CameraCard = styled(Card)`
  height: 100%;
  width: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
`;

const StatusCard = styled(Card)`
  height: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
`;

const ControlCard = styled(Card)`
  margin-top: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
`;

const StatusGrid = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const StatusItem = styled(Box)`
  padding: 8px 16px;
  background-color: #eaf1fd;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .MuiTypography-subtitle2 {
    color: #666666;
    font-size: 0.75rem;
    min-width: 80px;
  }

  .MuiTypography-body1 {
    font-weight: 500;
    color: #1976d2;
    font-size: 0.875rem;
    text-align: right;
  }
`;

const ButtonGroup = styled(Box)`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  justify-content: center;
`;

const ControlButton = styled(Button)`
  min-width: 140px;
  width: 140px;
  height: 44px;
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &.MuiButton-containedPrimary {
    background: linear-gradient(45deg, #059669, #10b981);
  }

  &.MuiButton-containedError {
    background: linear-gradient(45deg, #dc2626, #ef4444);
  }

  &.MuiButton-containedWarning {
    background: linear-gradient(45deg, #2563eb, #3b82f6);
  }

  &.MuiButton-containedSecondary {
    background: linear-gradient(45deg, #4b5563, #6b7280);
  }
`;

const TitleTypography = styled(Typography)`
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 16px;
`;

export {
  Container,
  MainContent,
  CameraSection,
  StatusSection,
  CameraCard,
  StatusCard,
  ControlCard,
  StatusGrid,
  StatusItem,
  ButtonGroup,
  ControlButton,
  TitleTypography,
};
