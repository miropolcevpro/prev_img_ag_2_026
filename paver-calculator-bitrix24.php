<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}
?>

<div class="paver-bitrix-page">
    <div id="paverConf2026"></div>
</div>

<script>
window.PAVER_LOGISTICS_CONFIG = {
    enabled: false,
    mountRootId: 'paverConf2026'
};

window.PAVER_BITRIX24_CONFIG = {
    enabled: true,
    rootId: 'paverConf2026',

    formId: 10,
    formCode: 'inline/10/6me0os',
    loaderUrl: 'https://cdn-ru.bitrix24.ru/b10322535/crm/form/loader_10.js',

    useOwnModal: true,
    hideCalculatorLeadForm: true,

    privacyPolicyUrl: 'https://st-ru.com/policy/_1.0.6_index.php',
    privacyPolicyText: 'политикой конфиденциальности',

    source: 'Калькулятор на сайте Стройторг',

    markers: {
        orderText: 'paver_order_text',
        orderJson: 'paver_order_json',
        total: 'paver_total',
        discount: 'paver_discount',
        pallets: 'paver_pallets',
        weight: 'paver_weight',
        priceVersion: 'paver_price_version',
        pageUrl: 'paver_page_url',
        source: 'paver_source',
        logistics: 'paver_logistics'
    }
};
</script>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-price-20260811-cachefix-v4.js?v=20260811-cacheproof-v4"></script>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-logistics-module.js?v=20260615-logistics-disabled-1"></script>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-bitrix24-adapter-20260811-cachefix-v5.js?v=20260811-bitrix-cacheproof-v5"></script>

<style>
.paver-bitrix-page {
    width: 100%;
    min-width: 0;
    margin: 0 auto;
}
</style>
