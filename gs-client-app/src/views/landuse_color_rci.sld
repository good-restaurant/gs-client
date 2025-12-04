<?xml version="1.0" encoding="UTF-8"?>
<sld:StyledLayerDescriptor version="1.0.0"
    xmlns="http://www.opengis.net/sld"
    xmlns:sld="http://www.opengis.net/sld"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:gml="http://www.opengis.net/gml">
  <sld:NamedLayer>
    <sld:Name>landuse_color</sld:Name>
    <sld:UserStyle>
      <sld:FeatureTypeStyle>
        <sld:Rule>
          <sld:RasterSymbolizer>
            <sld:ColorMap type="values">
              <!-- No Data -->
              <sld:ColorMapEntry color="#FFFFFF" quantity="0" opacity="0" label="No Data"/>
              
              <!-- R (Residential/주거) - 초록색 계열, 고밀도일수록 진함 -->
              <!-- 전용주거지역 (저밀도) - 연한 민트/라임색 계열로 구분 -->
              <sld:ColorMapEntry color="#B0FFB0" quantity="100" label="전용주거지역"/>
              <sld:ColorMapEntry color="#90EE90" quantity="101" label="1종 전용주거"/>
              <sld:ColorMapEntry color="#7CCD7C" quantity="102" label="2종 전용주거"/>
              <!-- 일반주거지역 (중고밀도) - 일반 초록색 계열 -->
              <sld:ColorMapEntry color="#E0F2E0" quantity="110" label="일반주거"/>
              <sld:ColorMapEntry color="#90EE90" quantity="111" label="1종 일반주거"/>
              <sld:ColorMapEntry color="#66CC66" quantity="112" label="2종 일반주거"/>
              <sld:ColorMapEntry color="#228B22" quantity="113" label="3종 일반주거"/>
              <!-- 준주거 (고밀도, 주거+상업 혼합) - 청록색 계열 -->
              <sld:ColorMapEntry color="#20B2AA" quantity="120" label="준주거"/>
              
              <!-- C (Commercial/상업) - 파랑색 계열, 고밀도일수록 진함 -->
              <sld:ColorMapEntry color="#000080" quantity="200" label="중심상업"/>
              <sld:ColorMapEntry color="#0000CD" quantity="201" label="일반상업"/>
              <sld:ColorMapEntry color="#4169E1" quantity="202" label="근린상업"/>
              <sld:ColorMapEntry color="#87CEEB" quantity="203" label="유통상업"/>
              
              <!-- I (Industrial/공업) - 노랑색 계열, 고밀도일수록 진함 -->
              <sld:ColorMapEntry color="#FF8C00" quantity="300" label="전용공업"/>
              <sld:ColorMapEntry color="#FFA500" quantity="301" label="일반공업"/>
              <sld:ColorMapEntry color="#FFD700" quantity="302" label="준공업"/>
              
              <!-- 녹지 - 하늘색 계열 -->
              <sld:ColorMapEntry color="#4682B4" quantity="400" label="보전녹지"/>
              <sld:ColorMapEntry color="#5F9EA0" quantity="401" label="생산녹지"/>
              <sld:ColorMapEntry color="#87CEEB" quantity="402" label="자연녹지"/>
              
              <!-- 관리지역 - 회색 계열 -->
              <sld:ColorMapEntry color="#696969" quantity="500" label="보전관리"/>
              <sld:ColorMapEntry color="#808080" quantity="501" label="생산관리"/>
              <sld:ColorMapEntry color="#A9A9A9" quantity="502" label="계획관리"/>
              
              <!-- 개발제한구역 - 보라색 -->
              <sld:ColorMapEntry color="#9370DB" quantity="601" label="개발제한구역"/>
            </sld:ColorMap>
          </sld:RasterSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </sld:NamedLayer>
</sld:StyledLayerDescriptor>

