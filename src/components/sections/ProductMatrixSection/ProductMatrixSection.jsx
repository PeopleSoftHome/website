import { PRODUCT_TABS }              from '../../../data/products';
import { useTabs }                   from '../../../hooks/useTabs';
import { useI18n }                   from '../../../i18n/index';
import { PRODUCT_KEY_MAP, TAB_KEY_MAP } from '../../../i18n/keyMap';
import SectionHeader                  from '../../ui/SectionHeader/SectionHeader';
import TabNav                         from '../../ui/TabNav/TabNav';
import ProductCard                    from './ProductCard';
import RevealWrapper                  from '../../ui/RevealWrapper/RevealWrapper';
import styles                         from './ProductMatrixSection.module.css';

export default function ProductMatrixSection() {
  const { activeIndex, selectTab } = useTabs(0);
  const { t }     = useI18n();
  const activeTab = PRODUCT_TABS[activeIndex];

  // 为 TabNav 注入翻译后的标签
  const translatedTabs = PRODUCT_TABS.map(tab => ({
    ...tab,
    label: t(`products.tabs.${TAB_KEY_MAP[tab.id] ?? tab.id}`),
  }));

  return (
    <section className={`section ${styles.section}`} id="products">
      <div className="container">
        <RevealWrapper>
          <SectionHeader
            tag={t('products.sectionTag')}
            title={t('products.sectionTitle')}
            subtitle={t('products.sectionSub')}
          />
        </RevealWrapper>

        <RevealWrapper>
          <TabNav
            tabs={translatedTabs}
            activeIndex={activeIndex}
            onSelect={selectTab}
            variant="segment"
          />
        </RevealWrapper>

        <div className={styles.grid} role="tabpanel">
          {activeTab.products.map((product, i) => {
            const key = PRODUCT_KEY_MAP[product.id];
            return (
              <ProductCard
                key={product.id}
                icon={product.icon}
                name={key ? t(`products.items.${key}.name`) : product.name}
                desc={key ? t(`products.items.${key}.desc`) : product.desc}
                linkText={t('products.linkText')}
                iconBg={product.iconBg    ?? activeTab.iconBg}
                iconColor={product.iconColor ?? activeTab.iconColor}
                delay={i % 4}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
