import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { Delete } from 'lucide-react';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { formatAmountInput } from 'utils/accountly/format';
import { useT } from 'i18n/accountly';

interface CalculatorKeypadProps {
  accent: string;
  accentDeep: string;
  memory: number;
  onDigit: (d: string) => void;
  onDot: () => void;
  onOperator: (op: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEquals: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onRecallMemory: () => void;
  onSubmit: () => void;
  submitLabel: ReactNode;
  submitDisabled?: boolean;
}

const CalculatorKeypad = ({
  accent,
  accentDeep,
  memory,
  onDigit,
  onDot,
  onOperator,
  onClear,
  onBackspace,
  onEquals,
  onMemoryAdd,
  onMemorySubtract,
  onRecallMemory,
  onSubmit,
  submitLabel,
  submitDisabled
}: CalculatorKeypadProps) => {
  const c = useAccountlyColors();
  const t = useT();

  const numKeySx = { bgcolor: c.surface, color: c.ink, border: `1px solid ${c.border}` };
  const opKeySx = { bgcolor: c.chipGrey, color: c.slate };
  const specialKeySx = { bgcolor: c.chipGrey, color: c.grey, fontSize: 15 };
  const accentKeySx = { bgcolor: accent, color: '#fff', '&:active': { transform: 'scale(0.94)', bgcolor: accentDeep } };

  const Key = ({ label, onClick, sx, flex = 1 }: { label: ReactNode; onClick: () => void; sx?: object; flex?: number }) => (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        flex,
        minWidth: 0,
        height: 50,
        p: 0,
        borderRadius: '14px',
        border: 'none',
        fontSize: 19,
        fontWeight: 500,
        fontFamily: DISPLAY,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform .1s ease',
        '&:active': { transform: 'scale(0.94)' },
        ...sx
      }}
    >
      {label}
    </Box>
  );

  const Row = ({ children }: { children: ReactNode }) => (
    <Box sx={{ display: 'flex', gap: 0.875, mt: 0.875, '&:first-of-type': { mt: 0 } }}>{children}</Box>
  );

  return (
    <Box>
      {memory !== 0 && (
        <Box
          component="button"
          onClick={onRecallMemory}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 1,
            px: 1.25,
            py: 0.5,
            borderRadius: '999px',
            border: `1px solid ${c.border}`,
            bgcolor: c.surface,
            cursor: 'pointer',
            fontFamily: DISPLAY
          }}
        >
          <Typography sx={{ fontSize: 11.5, fontWeight: 500, color: c.slate }}>
            M = {formatAmountInput(String(memory))} · {t('payment.tapToUse')}
          </Typography>
        </Box>
      )}
      <Row>
        <Key label="C" onClick={onClear} sx={{ ...specialKeySx, color: c.red }} />
        <Key label="M+" onClick={onMemoryAdd} sx={specialKeySx} />
        <Key label="M-" onClick={onMemorySubtract} sx={specialKeySx} />
        <Key label={<Delete size={19} />} onClick={onBackspace} sx={specialKeySx} />
      </Row>

      <Row>
        <Key label="7" onClick={() => onDigit('7')} sx={numKeySx} />
        <Key label="8" onClick={() => onDigit('8')} sx={numKeySx} />
        <Key label="9" onClick={() => onDigit('9')} sx={numKeySx} />
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', gap: 0.25 }}>
          <Key label="%" onClick={() => onOperator('%')} sx={{ ...opKeySx, fontSize: 15 }} />
          <Key label="÷" onClick={() => onOperator('÷')} sx={opKeySx} />
        </Box>
      </Row>

      <Row>
        <Key label="4" onClick={() => onDigit('4')} sx={numKeySx} />
        <Key label="5" onClick={() => onDigit('5')} sx={numKeySx} />
        <Key label="6" onClick={() => onDigit('6')} sx={numKeySx} />
        <Key label="×" onClick={() => onOperator('×')} sx={opKeySx} />
      </Row>

      <Row>
        <Key label="1" onClick={() => onDigit('1')} sx={numKeySx} />
        <Key label="2" onClick={() => onDigit('2')} sx={numKeySx} />
        <Key label="3" onClick={() => onDigit('3')} sx={numKeySx} />
        <Key label="−" onClick={() => onOperator('-')} sx={accentKeySx} />
      </Row>

      <Row>
        <Key label="0" onClick={() => onDigit('0')} sx={numKeySx} />
        <Key label="." onClick={onDot} sx={numKeySx} />
        <Key label="=" onClick={onEquals} sx={opKeySx} />
        <Key label="+" onClick={() => onOperator('+')} sx={accentKeySx} />
      </Row>

      <Box
        component="button"
        onClick={onSubmit}
        disabled={submitDisabled}
        sx={{
          width: '100%',
          height: 50,
          mt: 0.875,
          borderRadius: '14px',
          border: 'none',
          fontSize: 16,
          fontWeight: 500,
          fontFamily: DISPLAY,
          cursor: submitDisabled ? 'default' : 'pointer',
          bgcolor: accent,
          color: '#fff',
          opacity: submitDisabled ? 0.6 : 1,
          transition: 'transform .1s ease',
          '&:active': submitDisabled ? undefined : { transform: 'scale(0.98)', bgcolor: accentDeep }
        }}
      >
        {submitLabel}
      </Box>
    </Box>
  );
};

export default CalculatorKeypad;
