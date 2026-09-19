import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, Divider, IconButton, Menu, MenuItem, Skeleton, Stack, Typography } from '@mui/material';
import { pdf } from '@react-pdf/renderer';
import { Phone, MoreVertical, Settings, ArrowUp, ArrowDown, MessageCircle, MessageSquare, Share2, CalendarClock } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchContacts } from 'store/reducers/accountly/contacts';
import { fetchContactTransactions, resetContactView } from 'store/reducers/accountly/transactions';
import { useFormatAmount, formatPhone, formatDate } from 'utils/accountly/format';
import useDueText from 'hooks/useDueText';
import { dueState } from 'utils/accountly/due';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import { DISPLAY, avatarTint, initials, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, Fade, ListRow, IconDot, SectionHeader, FormAlert } from 'components/accountly/kit';
import LedgerDocument from 'components/accountly/LedgerDocument';
import { TransactionsEmptyIllustration } from 'components/accountly/EmptyIllustration';

const fmtWhen = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', '');
};

const ContactDetail = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const dueText = useDueText();
  const { business } = useAuth();
  const { currency } = useConfig();
  const { contacts, hasLoaded: contactsLoaded } = useSelector((s) => s.contacts);
  const { contactTransactions, contactStats, loadedContactId, loading } = useSelector((s) => s.transactions);
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  const contact = contacts.find((x) => x.id === id);
  const av = avatarTint(contact?.name || 'Contact');
  const balance = contactStats.contactBalance ?? contact?.balance ?? 0;
  const isCurrent = loadedContactId === id;
  const showSkeleton = !isCurrent && loading;

  const reminderDisabled = balance === 0 || !contact?.phone;
  const reminderPhone = (contact?.phone || '').replace(/[^0-9]/g, '');
  const reminderMessage =
    balance < 0
      ? t('detail.reminderDue', { name: contact?.name || '', amount: fmt(Math.abs(balance)), business: business?.business_name || '' })
      : t('detail.reminderOwed', { name: contact?.name || '', amount: fmt(Math.abs(balance)), business: business?.business_name || '' });
  const whatsappHref = reminderDisabled ? undefined : `https://wa.me/${reminderPhone}?text=${encodeURIComponent(reminderMessage)}`;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const smsHref = reminderDisabled ? undefined : `sms:${contact?.phone}${isIOS ? '&' : '?'}body=${encodeURIComponent(reminderMessage)}`;

  useEffect(() => {
    if (!contactsLoaded) dispatch(fetchContacts());
  }, [dispatch, contactsLoaded]);

  useEffect(() => {
    if (contactsLoaded && !contact) navigate('/contact', { replace: true });
  }, [contactsLoaded, contact, navigate]);

  useEffect(() => {
    if (!id) return;
    if (loadedContactId === id) return;
    dispatch(resetContactView(id));
    dispatch(fetchContactTransactions(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  const ledgerDisabled = contactTransactions.length === 0;

  const dueDate = contact && balance !== 0 ? contact.dueDate : null;
  const dueOverdue = dueDate ? dueState(dueDate) === 'overdue' : false;

  const handleShareLedger = async () => {
    setLedgerError(null);
    try {
      const result = await dispatch(fetchContactTransactions(id));
      if (!fetchContactTransactions.fulfilled.match(result)) {
        setLedgerError(t('detail.failedGenerateLedger'));
        return;
      }

      const { transactions: rawTransactions, contact_balance: freshBalance } = result.payload.response as {
        transactions: any[];
        contact_balance: number;
      };

      const businessName = business?.business_name || 'My Business';
      const contactLabel = contact?.name || 'Contact';
      const rows = [...rawTransactions].reverse().map((tx) => {
        const sent = tx.transaction_type === 'debit';
        return {
          date: formatDate(tx.created_at),
          label: sent ? t('ledger.givenTo', { name: contactLabel }) : t('ledger.receivedFrom', { name: contactLabel }),
          note: tx.description || undefined,
          debit: sent ? tx.amount : 0,
          credit: sent ? 0 : tx.amount,
          balance: tx.balance_after ?? 0
        };
      });

      const contactOwesBusiness = freshBalance < 0;

      const ASCII_CURRENCY_FALLBACK: Record<string, string> = { INR: 'Rs. ', NPR: 'Rs. ', LKR: 'Rs. ', PKR: 'Rs. ' };
      const pdfFormatAmount = (value: number) => {
        const raw = fmt(value);
        const symbolMatch = raw.match(/^(\D+)/);
        if (!symbolMatch) return raw;
        const symbol = symbolMatch[1];
        const isAsciiSafe = [...symbol].every((ch) => ch.charCodeAt(0) <= 255);
        if (isAsciiSafe) return raw;
        return raw.replace(symbol, ASCII_CURRENCY_FALLBACK[currency] || `${currency} `);
      };

      const blob = await pdf(
        <LedgerDocument
          businessName={businessName}
          businessAddress={business?.address}
          businessGst={business?.gst_number}
          contactName={contact?.name || 'Contact'}
          contactPhone={formatPhone(contact?.phone)}
          contactAddress={contact?.address}
          currentBalance={freshBalance}
          balanceLabel={contactOwesBusiness ? t('ledger.amountDue') : t('ledger.creditBalance')}
          balanceTone={contactOwesBusiness ? 'due' : 'credit'}
          formatAmount={pdfFormatAmount}
          rows={rows}
          labels={{
            statementTitle: t('ledger.statementTitle'),
            generatedOn: t('ledger.generatedOn'),
            billTo: t('ledger.billTo'),
            currentBalance: t('ledger.currentBalance'),
            transactions: t('detail.transactions'),
            date: t('ledger.date'),
            description: t('ledger.description'),
            debit: t('ledger.debit'),
            credit: t('ledger.credit'),
            balance: t('ledger.balance'),
            footer: t('ledger.footer'),
            page: t('ledger.page'),
            of: t('ledger.of')
          }}
        />
      ).toBlob();

      const filename = `${(contact?.name || 'contact').replace(/\s+/g, '-')}-ledger.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: businessName });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        setLedgerError(t('detail.failedGenerateLedger'));
      }
    }
  };

  const headerTitle = (
    <Stack
      component="button"
      type="button"
      onClick={() => navigate(`/contact/${id}/settings`)}
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        minWidth: 0,
        maxWidth: '100%',
        p: 0,
        border: 'none',
        bgcolor: 'transparent',
        color: 'inherit',
        font: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: contact?.imageUrl ? 'transparent' : av.bg,
          color: av.fg,
          fontFamily: DISPLAY,
          fontWeight: 500,
          fontSize: 13,
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        {contact?.imageUrl ? (
          <Box component="img" src={contact.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initials(contact?.name || 'C')
        )}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 15.5, color: c.ink, lineHeight: 1.15 }} noWrap>
          {contact?.name || 'Contact'}
        </Typography>
        <Typography sx={{ color: c.grey, fontSize: 11.5, fontWeight: 500 }} noWrap>
          {formatPhone(contact?.phone)}
          {contact?.contactType ? ` · ${t(`contactType.${contact.contactType}`)}` : ''}
        </Typography>
      </Box>
    </Stack>
  );

  const headerRight = (
    <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
      {contact?.phone && (
        <IconButton component="a" href={`tel:${contact.phone}`} sx={{ color: c.ink }}>
          <Phone size={18} />
        </IconButton>
      )}
      <IconButton onClick={handleShareLedger} disabled={ledgerDisabled} sx={{ color: c.ink }}>
        <Share2 size={18} />
      </IconButton>
      <IconButton onClick={(e) => setMenuEl(e.currentTarget)} sx={{ color: c.ink }}>
        <MoreVertical size={20} />
      </IconButton>
      <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)}>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            navigate(`/contact/${id}/settings`);
          }}
          sx={{ gap: 1.25 }}
        >
          <Settings size={16} /> {t('common.settings')}
        </MenuItem>
      </Menu>
    </Stack>
  );

  return (
    <>
      <AppHeader variant="screen" title={headerTitle} right={headerRight} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: `calc(72px + env(safe-area-inset-bottom, 0px))` }}>
        <Stack spacing={2.25}>
          <FormAlert message={ledgerError} />
          <Fade>
            <AppCard sx={{ p: 0 }}>
              <Stack direction="row" divider={<Divider orientation="vertical" flexItem sx={{ borderColor: c.line }} />}>
                <Box sx={{ flex: 1, textAlign: 'center', py: 2.5 }}>
                  {showSkeleton ? (
                    <>
                      <Skeleton variant="text" width={90} height={30} sx={{ mx: 'auto' }} />
                      <Skeleton variant="text" width={60} height={18} sx={{ mx: 'auto', mt: 0.25 }} />
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 22, color: balance < 0 ? c.greenDeep : c.redDeep }}>
                        {fmt(balance)}
                      </Typography>
                      <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500, mt: 0.25 }}>
                        {balance < 0 ? t('detail.youWillGet') : t('detail.youWillGive')}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', py: 2.5 }}>
                  {showSkeleton ? (
                    <>
                      <Skeleton variant="text" width={30} height={30} sx={{ mx: 'auto' }} />
                      <Skeleton variant="text" width={80} height={18} sx={{ mx: 'auto', mt: 0.25 }} />
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 22, color: c.slate }}>
                        {contactTransactions.length}
                      </Typography>
                      <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500, mt: 0.25 }}>{t('detail.transactions')}</Typography>
                    </>
                  )}
                </Box>
              </Stack>
            </AppCard>
          </Fade>

          {contact?.contactType !== 'supplier' && (
          <Stack direction="row" spacing={1}>
            <Box
              component="a"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (reminderDisabled) e.preventDefault();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                flex: 1,
                px: 0.5,
                py: 1.25,
                border: `1px solid ${c.border}`,
                borderRadius: '14px',
                bgcolor: 'transparent',
                color: reminderDisabled ? c.greyLight : c.ink,
                fontWeight: 500,
                fontSize: 12.5,
                fontFamily: DISPLAY,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: reminderDisabled ? 'not-allowed' : 'pointer',
                opacity: reminderDisabled ? 0.5 : 1,
                pointerEvents: reminderDisabled ? 'none' : 'auto'
              }}
            >
              <MessageCircle size={16} color={reminderDisabled ? c.greyLight : '#25D366'} />
              {t('detail.sendReminderWhatsapp')}
            </Box>

            <Box
              component="a"
              href={smsHref}
              onClick={(e) => {
                if (reminderDisabled) e.preventDefault();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                flex: 1,
                px: 0.5,
                py: 1.25,
                border: `1px solid ${c.border}`,
                borderRadius: '14px',
                bgcolor: 'transparent',
                color: reminderDisabled ? c.greyLight : c.ink,
                fontWeight: 500,
                fontSize: 12.5,
                fontFamily: DISPLAY,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: reminderDisabled ? 'not-allowed' : 'pointer',
                opacity: reminderDisabled ? 0.5 : 1,
                pointerEvents: reminderDisabled ? 'none' : 'auto'
              }}
            >
              <MessageSquare size={16} color={reminderDisabled ? c.greyLight : c.ink} />
              {t('detail.sendReminderSms')}
            </Box>
          </Stack>
          )}

          {showSkeleton ? (
            <Box>
              <SectionHeader title={t('detail.transactions')} />
              <AppCard sx={{ overflow: 'hidden' }}>
                {[0, 1, 2].map((i) => (
                  <Box key={i}>
                    {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                      <Skeleton variant="circular" width={44} height={44} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="text" width="35%" height={16} />
                      </Box>
                      <Skeleton variant="text" width={56} height={20} />
                    </Stack>
                  </Box>
                ))}
              </AppCard>
            </Box>
          ) : contactTransactions.length > 0 ? (
            <Fade delay={0.05}>
              <Box>
                <SectionHeader
                  title={t('detail.transactions')}
                  right={
                    dueDate ? (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1.25,
                          py: 0.375,
                          borderRadius: '999px',
                          bgcolor: dueOverdue ? c.redSoft : c.chipGrey,
                          color: dueOverdue ? c.redDeep : c.grey,
                          fontFamily: DISPLAY,
                          fontWeight: 500,
                          fontSize: 11.5,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <CalendarClock size={12} />
                        {dueText(dueDate)}
                      </Box>
                    ) : undefined
                  }
                />
                <AppCard
                  sx={{
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    maxHeight: 'clamp(220px, calc(100dvh - 420px), 480px)',
                    overscrollBehavior: 'contain'
                  }}
                >
                  {contactTransactions.map((tx, i) => {
                    const sent = tx.transaction_type === 'debit';
                    return (
                      <Box key={tx.id}>
                        {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                        <ListRow onClick={() => navigate(`/transaction/${tx.id}`, { state: { fromContact: true } })}>
                          <IconDot size={44} bg={sent ? c.redSoft : c.greenSoft} fg={sent ? c.redDeep : c.greenDeep}>
                            {sent ? <ArrowUp /> : <ArrowDown />}
                          </IconDot>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: c.ink }} noWrap>
                              {sent ? t('detail.youGave') : t('detail.youGot')}
                            </Typography>
                            <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                              {fmtWhen(tx.createdAt)}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 500, fontSize: 14.5, flexShrink: 0, color: sent ? c.redDeep : c.greenDeep }} noWrap>
                            {fmt(tx.amount)}
                          </Typography>
                        </ListRow>
                      </Box>
                    );
                  })}
                </AppCard>
              </Box>
            </Fade>
          ) : (
            <AppCard sx={{ px: 3, py: 4.5, textAlign: 'center' }}>
              <Box sx={{ mb: 1.5 }}>
                <TransactionsEmptyIllustration />
              </Box>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 15.5 }}>{t('detail.noTransactionsYet')}</Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>{t('detail.recordBelow')}</Typography>
            </AppCard>
          )}
        </Stack>
      </Container>

      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 25,
          px: 1.5,
          pt: 1.5,
          pb: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          background: `linear-gradient(180deg, rgba(238,241,245,0) 0%, ${c.bg} 40%)`,
          transform: 'translateZ(0)',
          WebkitTransform: 'translate3d(0,0,0)',
          pointerEvents: 'none'
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Stack direction="row" spacing={1.25} sx={{ pointerEvents: 'auto' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ArrowUp size={18} />}
              onClick={() => navigate(`/transaction/new?contactId=${id}&type=payment`)}
              sx={{ bgcolor: c.red, boxShadow: 'none', '&:hover': { bgcolor: c.redDeep } }}
            >
              {t('detail.youGaveBtn')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<ArrowDown size={18} />}
              onClick={() => navigate(`/transaction/new?contactId=${id}&type=refund`)}
              sx={{ bgcolor: c.green, boxShadow: 'none', '&:hover': { bgcolor: c.greenDeep } }}
            >
              {t('detail.youGotBtn')}
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default ContactDetail;
