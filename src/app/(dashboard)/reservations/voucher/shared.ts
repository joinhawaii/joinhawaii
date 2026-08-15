import { defaultVoucherValues } from '@/constants';

export type VoucherProductClientContainerProps = {
  reservationId: string;
  productId?: string;
};

export type VoucherSharedFormState = typeof defaultVoucherValues;

type VoucherClient = {
  is_main_client?: boolean;
  korean_name?: string;
  english_name?: string;
};

type ProductWithId = {
  id?: number | string;
};

export function getSelectedProductById<T extends ProductWithId>(products: T[], productId?: string) {
  if (productId) {
    const byId = products.find(({ id }) => String(id) === productId);
    if (byId) return byId;
  }

  return products[0];
}

export function hasRenderableTiptapContent(content: string | null | undefined) {
  if (!content) return false;

  const normalized = content.replace(/\u200B/g, '').trim();
  if (!normalized) return false;

  const withoutEmptyParagraph = normalized
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .trim();

  if (/<img\b/i.test(withoutEmptyParagraph)) {
    return true;
  }

  const plainText = withoutEmptyParagraph
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, '')
    .trim();

  return plainText.length > 0;
}

export function toPrintableFileNamePart(value: string | null | undefined, fallback: string) {
  const sanitized = (value ?? '')
    .trim()
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/g, '')
    .trim();

  return sanitized || fallback;
}

export function toPrintableDate(value: string | null | undefined) {
  if (!value) return new Date().toISOString().slice(0, 10);

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function printWithDocumentTitle(fileName: string) {
  const previousTitle = document.title;
  let restored = false;

  const restoreTitle = () => {
    if (restored) return;
    restored = true;
    document.title = previousTitle;
    window.removeEventListener('afterprint', restoreTitle);
    window.removeEventListener('focus', handleWindowFocus);
  };

  const handleWindowFocus = () => {
    setTimeout(restoreTitle, 0);
  };

  document.title = fileName;
  window.addEventListener('afterprint', restoreTitle, { once: true });
  window.addEventListener('focus', handleWindowFocus, { once: true });
  window.print();
}

type BuildVoucherPrintFileNameArgs = {
  clients: VoucherClient[];
  date: string | null | undefined;
  productName: string | null | undefined;
  productFallback: string;
  clientFallback?: string;
};

export function buildVoucherPrintFileName({
  clients,
  date,
  productName,
  productFallback,
  clientFallback = '고객'
}: BuildVoucherPrintFileNameArgs) {
  const representativeClient = clients.find(client => client.is_main_client) ?? clients[0];
  const representativeName = toPrintableFileNamePart(
    representativeClient?.korean_name || representativeClient?.english_name,
    clientFallback
  );
  const productLabel = toPrintableFileNamePart(productName, productFallback);
  const datePart = toPrintableDate(date);

  return `${datePart}_${representativeName}님_${productLabel}`;
}
